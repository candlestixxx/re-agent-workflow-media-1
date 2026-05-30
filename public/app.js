document.addEventListener('DOMContentLoaded', () => {
    const jobsContainer = document.getElementById('jobs-container');
    const refreshBtn = document.getElementById('refresh-btn');
    const activeJobsCount = document.getElementById('active-jobs-count');
    const completedJobsCount = document.getElementById('completed-jobs-count');
    const modal = document.getElementById('job-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    let allJobs = [];

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/jobs');
            const jobs = await response.json();
            allJobs = jobs;
            renderJobs(jobs);
            updateStats(jobs);

            // Check for mock mode
            const isMock = jobs.some(j => j.id.startsWith('mock-job'));
            const statusText = document.querySelector('.status-text');
            const dot = document.querySelector('.dot');
            if (isMock) {
                statusText.textContent = 'Mock Mode Active (DB Disconnected)';
                dot.style.background = 'var(--warning)';
                dot.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.2)';
            } else {
                statusText.textContent = 'System Active (Connected)';
                dot.style.background = 'var(--success)';
                dot.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.2)';
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            jobsContainer.innerHTML = '<div class="error">Failed to load pipeline data. Please ensure the server is running.</div>';
        }
    };

    const renderJobs = (jobs) => {
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<div class="no-jobs">No pipeline jobs found. Trigger a webhook to start!</div>';
            return;
        }

        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card" onclick="viewJobDetails('${job.id}')">
                <div class="job-card-header">
                    <span class="job-badge badge-${getStatusClass(job.status)}">${job.status.replace('_', ' ')}</span>
                    <span class="mls-id">MLS: ${job.mlsId || 'N/A'}</span>
                </div>
                <h4>${job.propertyAddress}</h4>
                <div class="job-meta">
                    <span><strong>Stage:</strong> ${job.stage}</span>
                    <span><strong>Agent:</strong> ${job.createdBy}</span>
                </div>
                <div class="job-footer">
                    <span class="job-date">${new Date(job.createdAt).toLocaleDateString()}</span>
                    <button class="btn-view">View Details →</button>
                </div>
            </div>
        `).join('');
    };

    const getStatusClass = (status) => {
        const s = status.toLowerCase();
        if (s.includes('pending')) return 'pending';
        if (s.includes('generation') || s.includes('processing')) return 'generation';
        if (s.includes('completed') || s.includes('published')) return 'completed';
        if (s.includes('failed') || s.includes('error')) return 'failed';
        return 'pending';
    };

    const updateStats = (jobs) => {
        const active = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Failed').length;
        const completedToday = jobs.filter(j => {
            const date = new Date(j.updatedAt);
            const today = new Date();
            return j.status === 'Completed' && date.toDateString() === today.toDateString();
        }).length;

        activeJobsCount.textContent = active;
        completedJobsCount.textContent = completedToday;
    };

    window.viewJobDetails = (jobId) => {
        const job = allJobs.find(j => j.id === jobId);
        if (!job) return;

        modalBody.innerHTML = `
            <h2>Job Details: ${job.propertyAddress}</h2>
            <hr style="margin: 16px 0; border: 0; border-top: 1px solid var(--border);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div>
                    <p><strong>Job ID:</strong> ${job.id}</p>
                    <p><strong>MLS ID:</strong> ${job.mlsId || 'N/A'}</p>
                    <p><strong>Stage:</strong> ${job.stage}</p>
                    <p><strong>Status:</strong> <span class="job-badge badge-${getStatusClass(job.status)}">${job.status}</span></p>
                </div>
                <div>
                    <p><strong>Created By:</strong> ${job.createdBy}</p>
                    <p><strong>Created At:</strong> ${new Date(job.createdAt).toLocaleString()}</p>
                    <p><strong>Updated At:</strong> ${new Date(job.updatedAt).toLocaleString()}</p>
                </div>
            </div>
            <div style="margin-top: 24px;">
                <p><strong>Source Folder:</strong></p>
                <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">${job.sourceFolderPath}</code>
            </div>
            <div style="margin-top: 32px; display: flex; gap: 12px;">
                <button class="btn-secondary" onclick="alert('Relaunching pipeline...')">Relaunch Job</button>
                <button class="btn-secondary" onclick="alert('Viewing assets...')">View Assets</button>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    refreshBtn.addEventListener('click', () => {
        refreshBtn.textContent = 'Refreshing...';
        fetchJobs().then(() => {
            setTimeout(() => {
                refreshBtn.textContent = 'Refresh Data';
            }, 500);
        });
    });

    // Initial fetch
    fetchJobs();
});
