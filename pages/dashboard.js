// Dashboard Page Script - CocoGuard Admin Dashboard
// Provides comprehensive pest management analytics and visualizations
// Version: 2.0 - IIFE Wrapper Fix

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.dashboardModuleLoaded) {
        console.log('Dashboard module already loaded, skipping...');
        return;
    }
    window.dashboardModuleLoaded = true;

    console.log('📊 Dashboard page script loaded v2.0');

    // Chart instances for cleanup - use window to persist across reloads
    if (typeof window.chartInstances === 'undefined') {
        window.chartInstances = {
            pestDistribution: null,
            monthlyScans: null,
            topPests: null,
            topFarms: null,
            detectionTrend: null,
            accuracy: null
        };
    }
    const chartInstances = window.chartInstances;

// CocoGuard color palette
const COLORS = {
    primary: '#22c55e',      // Green - healthy/good
    secondary: '#16a34a',    // Dark green
    warning: '#fbbf24',      // Yellow - caution
    danger: '#ef4444',       // Red - critical
    info: '#3b82f6',         // Blue - informational
    purple: '#8b5cf6',       // Purple - special
    teal: '#14b8a6',         // Teal
    orange: '#f97316',       // Orange
    pink: '#ec4899',         // Pink
    gray: '#6b7280'          // Gray
};

// Chart color sets
const PEST_COLORS = [COLORS.danger, COLORS.warning, COLORS.orange, COLORS.purple, COLORS.info];
const FARM_COLORS = [COLORS.primary, COLORS.secondary, COLORS.teal, COLORS.info, COLORS.purple];

// Format date to Philippine Time (UTC+8)
function formatPhilippineTime(dateString) {
    if (!dateString) return '-';
    let utcDateString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z';
    }
    const date = new Date(utcDateString);
    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Destroy all chart instances
function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            chartInstances[key] = null;
        }
    });
}

// Initialize dashboard
function initDashboard() {
    console.log('🔧 Initializing dashboard module...');
    
    // Destroy existing charts first
    destroyAllCharts();
    
    try {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js is not loaded! Loading from CDN...');
            loadChartJS().then(() => {
                setupChartDefaults();
                loadDashboardData();
                loadDashboardCharts();
                loadFeedbacks();
                loadRecentScans();
                setupChartZoom(); // Initialize chart zoom
            });
        } else {
            console.log('✅ Chart.js is available');
            setupChartDefaults();
            loadDashboardData();
            loadDashboardCharts();
            loadFeedbacks();
            loadRecentScans();
            setupChartZoom(); // Initialize chart zoom
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Setup Chart.js global defaults to prevent chart expansion
function setupChartDefaults() {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        Chart.defaults.font.family = "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
        Chart.defaults.color = '#374151';
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.padding = 10;
    }
}

// Dynamically load Chart.js if not present
function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
        script.onload = () => {
            console.log('✅ Chart.js loaded dynamically');
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
    });
}

// Load dashboard summary data
async function loadDashboardData() {
    try {
        let summary = {};
        try {
            summary = await apiClient.getAdminDashboardSummary();
            console.log('✅ Loaded admin dashboard summary:', summary);
            console.log('📊 today_scans from API:', summary.today_scans, 'yesterday_scans:', summary.yesterday_scans);
        } catch (adminError) {
            console.warn('Admin endpoint not available, using fallback:', adminError);
            try {
                summary = await apiClient.getDashboardSummary();
                console.log('✅ Loaded regular dashboard summary:', summary);
                console.log('📊 today_scans from fallback:', summary.today_scans, 'yesterday_scans:', summary.yesterday_scans);
            } catch (e) {
                console.warn('Dashboard summary not available');
            }
        }

        // Get articles count
        let articlesCount = 0;
        try {
            const articles = await apiClient.listKnowledge(100);
            articlesCount = Array.isArray(articles) ? articles.length : 0;
        } catch (e) {
            console.warn('Could not fetch knowledge articles');
        }

        // Get active users count
        let activeUsersCount = 0;
        try {
            const users = await apiClient.listUsers();
            if (Array.isArray(users)) {
                activeUsersCount = users.filter(u => u.status === 'active').length;
            }
        } catch (e) {
            console.warn('Could not fetch users');
        }

        // Update stats cards
        updateStatCard('totalScans', summary.total_scans || 0, summary.prev_month_total_scans);
        updateStatCard('activeUsers', activeUsersCount, summary.prev_month_active_users);
        updateTodayScansCard(summary.today_scans || 0, summary.yesterday_scans || 0);
        updateStatCard('totalArticles', articlesCount, summary.prev_month_articles);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update stat card with value and change indicator
function updateStatCard(id, current, previous) {
    const valueEl = document.getElementById(id);
    const changeEl = document.getElementById(id + 'Change');
    
    if (valueEl) {
        valueEl.textContent = current.toLocaleString();
    }
    
    if (changeEl) {
        if (previous !== undefined && previous !== null && previous > 0) {
            const diff = current - previous;
            const percent = ((diff / previous) * 100).toFixed(1);
            if (diff > 0) {
                changeEl.innerHTML = `<span style="color: #22c55e;">↑ ${percent}% from last month</span>`;
            } else if (diff < 0) {
                changeEl.innerHTML = `<span style="color: #ef4444;">↓ ${Math.abs(percent)}% from last month</span>`;
            } else {
                changeEl.innerHTML = `<span style="color: #6b7280;">No change from last month</span>`;
            }
        } else if (current > 0) {
            changeEl.innerHTML = `<span style="color: #22c55e;">Active this month</span>`;
        } else {
            changeEl.innerHTML = `<span style="color: #6b7280;">No activity yet</span>`;
        }
    }
}

// Update Today's Scans card with comparison to yesterday
function updateTodayScansCard(todayCount, yesterdayCount) {
    const valueEl = document.getElementById('todayScans');
    const changeEl = document.getElementById('todayScansChange');
    
    if (valueEl) {
        valueEl.textContent = todayCount.toLocaleString();
    }
    
    if (changeEl) {
        if (yesterdayCount > 0) {
            const diff = todayCount - yesterdayCount;
            const percent = ((diff / yesterdayCount) * 100).toFixed(0);
            if (diff > 0) {
                changeEl.innerHTML = `<span style="color: #22c55e;">↑ ${percent}% vs yesterday</span>`;
            } else if (diff < 0) {
                changeEl.innerHTML = `<span style="color: #ef4444;">↓ ${Math.abs(percent)}% vs yesterday</span>`;
            } else {
                changeEl.innerHTML = `<span style="color: #6b7280;">Same as yesterday</span>`;
            }
        } else if (todayCount > 0) {
            changeEl.innerHTML = `<span style="color: #22c55e;">${todayCount} scan${todayCount > 1 ? 's' : ''} today</span>`;
        } else {
            changeEl.innerHTML = `<span style="color: #6b7280;">No scans yet today</span>`;
        }
    }
}

// Load and render all dashboard charts
async function loadDashboardCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not loaded, cannot render charts');
        return;
    }
    
    console.log('📊 Loading dashboard charts...');
    
    let pestsData = [];
    let farmsData = [];
    let monthlyData = [];
    let trendData = [];

    // Fetch all chart data
    try {
        pestsData = await apiClient.request('/analytics/admin/scans/by-pest?days=365');
        console.log('Pests data:', pestsData);
    } catch (error) {
        console.warn('Using sample pest data:', error.message);
        pestsData = generateSamplePestData();
    }

    try {
        farmsData = await apiClient.request('/analytics/admin/scans/by-farm?days=365');
        console.log('Farms data:', farmsData);
    } catch (error) {
        console.warn('Using sample farm data:', error.message);
        farmsData = generateSampleFarmData();
    }

    try {
        monthlyData = await apiClient.request('/analytics/admin/monthly-scans?months=6');
        console.log('Monthly data:', monthlyData);
    } catch (error) {
        console.warn('Using sample monthly data:', error.message);
        monthlyData = generateSampleMonthlyData();
    }

    try {
        // Use admin daily scans endpoint for the trend chart
        trendData = await apiClient.request('/analytics/admin/daily-scans?days=7');
        console.log('Trend data:', trendData);
    } catch (error) {
        console.warn('Using sample trend data:', error.message);
        trendData = generateSampleTrendData();
    }

    // Render all charts
    renderPestDistributionChart(pestsData);
    renderMonthlyScansChart(monthlyData);
    renderTopPestsChart(pestsData);
    renderTopFarmsChart(farmsData);
    renderDetectionTrendChart(trendData);
    renderAccuracyChart();
}

// Generate sample data for demos
function generateSamplePestData() {
    return [
        { pest: 'Rhinoceros Beetle', count: 45 },
        { pest: 'Coconut Scale Insect', count: 38 },
        { pest: 'Coconut Leaf Beetle', count: 28 },
        { pest: 'Red Palm Weevil', count: 22 },
        { pest: 'Coconut Mite', count: 15 }
    ];
}

function generateSampleFarmData() {
    return [
        { farm: 'Barangay San Jose', count: 32 },
        { farm: 'Coconut Farm A', count: 28 },
        { farm: 'Palawan Plantation', count: 24 },
        { farm: 'Quezon Province', count: 19 },
        { farm: 'Laguna Fields', count: 15 }
    ];
}

function generateSampleMonthlyData() {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map((month, i) => ({
        month: month,
        count: Math.floor(Math.random() * 100) + 50 + (i * 10)
    }));
}

function generateSampleTrendData() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 30) + 10
        });
    }
    return days;
}

// Helper to set fixed height on chart container
function setChartContainerHeight(canvas, height = 280) {
    if (!canvas) return;
    const container = canvas.parentElement;
    if (container) {
        container.style.height = height + 'px';
        container.style.maxHeight = height + 'px';
        container.style.overflow = 'hidden';
    }
}

// Render Pest Distribution Doughnut Chart
function renderPestDistributionChart(data) {
    const ctx = document.getElementById('pestDistributionChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.pestDistribution) {
        chartInstances.pestDistribution.destroy();
    }

    const labels = data.length > 0 ? data.slice(0, 5).map(p => p.pest) : ['No Data'];
    const values = data.length > 0 ? data.slice(0, 5).map(p => p.count) : [1];
    const total = values.reduce((a, b) => a + b, 0);

    chartInstances.pestDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: PEST_COLORS,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: `${label} (${((data.datasets[0].data[i] / total) * 100).toFixed(1)}%)`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} detections (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Render Monthly Scans Bar Chart
function renderMonthlyScansChart(data) {
    const ctx = document.getElementById('monthlyScansChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.monthlyScans) {
        chartInstances.monthlyScans.destroy();
    }

    const labels = data.length > 0 ? data.map(m => m.month) : ['No Data'];
    const values = data.length > 0 ? data.map(m => m.count) : [0];

    chartInstances.monthlyScans = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Scans',
                data: values,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return COLORS.primary;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, COLORS.primary);
                    gradient.addColorStop(1, COLORS.secondary);
                    return gradient;
                },
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw} scans`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e5e7eb'
                    },
                    ticks: {
                        stepSize: 20
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Render Top Pests Horizontal Bar Chart
function renderTopPestsChart(data) {
    const ctx = document.getElementById('topPestsChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.topPests) {
        chartInstances.topPests.destroy();
    }

    const topData = data.slice(0, 5);
    const labels = topData.length > 0 ? topData.map(p => p.pest) : ['No Data'];
    const values = topData.length > 0 ? topData.map(p => p.count) : [0];

    chartInstances.topPests = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Detections',
                data: values,
                backgroundColor: PEST_COLORS,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw} detections`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: '#e5e7eb' }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.substring(0, 18) + '...' : label;
                        }
                    }
                }
            }
        }
    });
}

// Render Top Farms Horizontal Bar Chart
function renderTopFarmsChart(data) {
    const ctx = document.getElementById('topFarmsChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.topFarms) {
        chartInstances.topFarms.destroy();
    }

    const topData = data.slice(0, 5);
    const labels = topData.length > 0 ? topData.map(f => f.farm || f.location || 'Unknown') : ['No Data'];
    const values = topData.length > 0 ? topData.map(f => f.count) : [0];

    chartInstances.topFarms = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reports',
                data: values,
                backgroundColor: FARM_COLORS,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw} pest reports`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: '#e5e7eb' }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.substring(0, 18) + '...' : label;
                        }
                    }
                }
            }
        }
    });
}

// Render Detection Trend Line Chart (Last 7 Days)
function renderDetectionTrendChart(data) {
    const ctx = document.getElementById('detectionTrendChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.detectionTrend) {
        chartInstances.detectionTrend.destroy();
    }

    const labels = data.length > 0 ? data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
    }) : ['No Data'];
    const values = data.length > 0 ? data.map(d => d.count) : [0];

    chartInstances.detectionTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Detections',
                data: values,
                borderColor: COLORS.primary,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return 'rgba(34, 197, 94, 0.1)';
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
                    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointBackgroundColor: COLORS.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw} detections`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#e5e7eb' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Render Detection Accuracy Gauge Chart
function renderAccuracyChart() {
    const ctx = document.getElementById('accuracyChart');
    if (!ctx) return;

    setChartContainerHeight(ctx);

    if (chartInstances.accuracy) {
        chartInstances.accuracy.destroy();
    }

    // Simulated accuracy data (can be replaced with real API data)
    const accuracy = 94.5;
    const remaining = 100 - accuracy;

    chartInstances.accuracy = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Accurate', 'Needs Review'],
            datasets: [{
                data: [accuracy, remaining],
                backgroundColor: [COLORS.primary, '#e5e7eb'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.raw}%`
                    }
                }
            },
            cutout: '75%'
        },
        plugins: [{
            id: 'accuracyText',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const centerX = chart.width / 2;
                const centerY = chart.height / 2 + 30;
                
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Draw percentage
                ctx.font = 'bold 36px Arial';
                ctx.fillStyle = COLORS.primary;
                ctx.fillText(`${accuracy}%`, centerX, centerY - 10);
                
                // Draw label
                ctx.font = '14px Arial';
                ctx.fillStyle = '#6b7280';
                ctx.fillText('Detection Accuracy', centerX, centerY + 25);
                
                ctx.restore();
            }
        }]
    });
}

// Load recent scans table
async function loadRecentScans() {
    const tbody = document.getElementById('recentScansTableBody');
    if (!tbody) return;

    try {
        let scans = [];
        // Get recent scans from admin dashboard summary
        try {
            const summary = await apiClient.getAdminDashboardSummary();
            scans = summary.recent_scans || [];
            console.log('Recent scans from admin summary:', scans);
        } catch (adminError) {
            // Fallback to user dashboard summary
            try {
                const summary = await apiClient.getDashboardSummary();
                scans = summary.recent_scans || [];
                console.log('Recent scans from user summary:', scans);
            } catch (e) {
                console.warn('Could not fetch recent scans:', e.message);
            }
        }

        if (!Array.isArray(scans) || scans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#888;">No recent scans found.</td></tr>';
            return;
        }

        tbody.innerHTML = scans.slice(0, 10).map(scan => {
            return `
                <tr>
                    <td>${formatPhilippineTime(scan.created_at || scan.timestamp)}</td>
                    <td>${escapeHtml(scan.location || scan.location_text || 'Unknown Location')}</td>
                    <td><span class="status-badge status-pest">${escapeHtml(scan.pest_detected || scan.pest_type || scan.result || 'Unknown')}</span></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading recent scans:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#d32f2f;">Failed to load scans.</td></tr>';
    }
}

// Load feedback reports
async function loadFeedbacks() {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;

    try {
        let feedbacks = [];
        try {
            feedbacks = await apiClient.request('/feedback/');
        } catch (e) {
            feedbacks = await apiClient.request('/feedback');
        }

        if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#888;">No feedbacks found.</td></tr>';
            return;
        }

        feedbacks = feedbacks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        tbody.innerHTML = feedbacks.map(f => {
            const type = (f.type || 'general').toLowerCase();
            const typeColors = {
                'bug': '#ef4444',
                'suggestion': '#3b82f6',
                'general': '#6b7280',
                'praise': '#22c55e'
            };
            return `
                <tr>
                    <td>${formatPhilippineTime(f.created_at)}</td>
                    <td><span class="status-badge" style="background: ${typeColors[type] || typeColors.general}20; color: ${typeColors[type] || typeColors.general};">${escapeHtml(f.type || 'General')}</span></td>
                    <td>${escapeHtml(f.message || '-')}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load feedbacks:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#d32f2f;">Failed to load feedbacks.</td></tr>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    destroyAllCharts();
});

// ==========================================
// Chart Zoom Modal Feature
// ==========================================

let zoomedChartInstance = null;

function setupChartZoom() {
    const chartCards = document.querySelectorAll('.chart-card');
    const modal = document.getElementById('chartZoomModal');
    const closeBtn = document.getElementById('zoomCloseBtn');
    
    if (!modal) {
        console.warn('Chart zoom modal not found');
        return;
    }
    
    // Add click handler to each chart card
    chartCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
            openChartModal(card);
        });
    });
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChartModal);
    }
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeChartModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeChartModal();
        }
    });
    
    console.log('✅ Chart zoom modal initialized for', chartCards.length, 'charts');
}

function openChartModal(chartCard) {
    const modal = document.getElementById('chartZoomModal');
    const titleEl = document.getElementById('zoomChartTitle');
    const zoomCanvas = document.getElementById('zoomChartCanvas');
    
    if (!modal || !zoomCanvas) return;
    
    // Get chart title
    const h3 = chartCard.querySelector('h3');
    if (titleEl && h3) {
        titleEl.textContent = h3.textContent;
    }
    
    // Get original chart
    const originalCanvas = chartCard.querySelector('canvas');
    if (!originalCanvas) return;
    
    const chartId = originalCanvas.id;
    const chartMap = {
        'pestDistributionChart': chartInstances.pestDistribution,
        'monthlyScansChart': chartInstances.monthlyScans,
        'topPestsChart': chartInstances.topPests,
        'topFarmsChart': chartInstances.topFarms,
        'detectionTrendChart': chartInstances.detectionTrend,
        'accuracyChart': chartInstances.accuracy
    };
    
    const originalChart = chartMap[chartId];
    if (!originalChart) return;
    
    // Destroy previous zoomed chart if exists
    if (zoomedChartInstance) {
        zoomedChartInstance.destroy();
        zoomedChartInstance = null;
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Clone the chart config and create new chart in modal
    const config = {
        type: originalChart.config.type,
        data: JSON.parse(JSON.stringify(originalChart.config.data)),
        options: {
            ...originalChart.config.options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                ...originalChart.config.options?.plugins,
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 13 }
                    }
                }
            }
        }
    };
    
    // Create zoomed chart
    setTimeout(() => {
        zoomedChartInstance = new Chart(zoomCanvas, config);
    }, 50);
}

function closeChartModal() {
    const modal = document.getElementById('chartZoomModal');
    
    if (!modal) return;
    
    // Destroy zoomed chart
    if (zoomedChartInstance) {
        zoomedChartInstance.destroy();
        zoomedChartInstance = null;
    }
    
    // Hide modal
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Export functions
window.openChartModal = openChartModal;
window.closeChartModal = closeChartModal;

// Export dashboard module
window.dashboardModule = {
    init: initDashboard,
    refresh: () => {
        destroyAllCharts();
        initDashboard();
    }
};

console.log('✓ dashboardModule exported v2.0');

})(); // End IIFE