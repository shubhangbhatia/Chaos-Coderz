// ===== ANIMATION ON SCROLL =====
document.addEventListener('DOMContentLoaded', function () {

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });

    // ===== NAVBAR SCROLL EFFECT =====
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        window.addEventListener('scroll', function () {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
            } else {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            }

            lastScroll = currentScroll;
        });
    }

    // ===== SEARCH BAR FOCUS EFFECT =====
    const searchInputs = document.querySelectorAll('input[type="search"]');

    searchInputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.parentElement.style.transition = 'all 0.3s ease';
        });

        input.addEventListener('blur', function () {
            this.parentElement.parentElement.style.transform = 'scale(1)';
        });
    });

    // ===== TRANSACTION TABLE ANIMATIONS =====
    const tableRows = document.querySelectorAll('.table tbody tr');

    tableRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 100);
    });

    // ===== STATS COUNTER ANIMATION =====
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const isNegative = target < 0;
        const absTarget = Math.abs(target);
        const increment = absTarget / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= absTarget) {
                element.textContent = (isNegative ? '-₹' : '₹') + absTarget.toLocaleString('en-IN');
                clearInterval(timer);
            } else {
                element.textContent = (isNegative ? '-₹' : '₹') + Math.floor(current).toLocaleString('en-IN');
            }
        }, 16);
    }

    // Animate balance and status amounts on load
    const balanceAmount = document.querySelector('.expense-amount');
    if (balanceAmount) {
        const text = balanceAmount.textContent.trim();
        // Check for negative sign
        const isNegative = text.includes('-');
        const amount = parseInt(text.replace(/[^0-9]/g, ''));
        if (!isNaN(amount)) {
            const finalAmount = isNegative ? -amount : amount;
            balanceAmount.textContent = isNegative ? '-₹0' : '₹0';
            setTimeout(() => {
                animateCounter(balanceAmount, finalAmount);
            }, 500);
        }
    }

    // ===== BUTTON RIPPLE EFFECT =====
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // ===== TRANSACTION FILTERING =====
    const filterButtons = document.querySelectorAll('[data-filter]');
    const transactionRows = document.querySelectorAll('tr[data-type]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            transactionRows.forEach(row => {
                const type = row.getAttribute('data-type');
                if (filterValue === 'all' || filterValue === type) {
                    row.style.display = '';
                    // Re-trigger animation
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-10px)';
                    setTimeout(() => {
                        row.style.opacity = '1';
                        row.style.transform = 'translateX(0)';
                    }, 50);
                } else {
                    row.style.display = 'none';
                }
            });

            // Handle "No transactions found" if all rows are hidden
            const visibleRows = Array.from(transactionRows).filter(row => row.style.display !== 'none');
            const noTransactionsMsg = document.getElementById('no-transactions-filter');

            if (visibleRows.length === 0 && transactionRows.length > 0) {
                if (!noTransactionsMsg) {
                    const tbody = document.querySelector('.table tbody');
                    const tr = document.createElement('tr');
                    tr.id = 'no-transactions-filter';
                    tr.innerHTML = `
                        <td colspan="5" class="text-center py-4">
                            <p class="text-muted mb-0">No ${filterValue} transactions found.</p>
                        </td>
                    `;
                    tbody.appendChild(tr);
                } else {
                    noTransactionsMsg.querySelector('p').textContent = `No ${filterValue} transactions found.`;
                    noTransactionsMsg.style.display = '';
                }
            } else if (noTransactionsMsg) {
                noTransactionsMsg.style.display = 'none';
            }
        });
    });

    // ===== AUTO-HIDE ALERTS =====
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });

});

// Add CSS for ripple effect and other animations
if (!document.getElementById('custom-animations-style')) {
    const style = document.createElement('style');
    style.id = 'custom-animations-style';
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .stats-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
    `;
    document.head.appendChild(style);
}
