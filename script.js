document.addEventListener('DOMContentLoaded', function() {
    // Repository data based on the screenshot
    const repositories = [
        {
            name: "hawaii-tours",
            description: "A website for hawaii tour guides",
            language: null,
            status: "Updated 11 hours ago",
            isPublic: true
        },
        {
            name: "MBTA-poster",
            description: "A poster that has live updates of the MBTA train system (green line only)",
            language: "C++",
            status: "Updated 3 days ago",
            isPublic: true
        },
        {
            name: "ryanlindell.github.io",
            description: "website",
            language: "HTML",
            status: "Updated on Nov 18, 2024",
            isPublic: true
        },
        {
            name: "rocket-pygame",
            description: "",
            language: "Python",
            status: "Updated on Nov 17, 2024",
            isPublic: false
        }
    ];

    // Function to get appropriate color for language
    function getLanguageColor(language) {
        const colors = {
            "Python": "#3572A5",
            "C++": "#f34b7d",
            "HTML": "#e34c26",
            "CSS": "#563d7c",
            "JavaScript": "#f1e05a"
        };
        return colors[language] || "#858585";
    }

    // Function to create project cards
    function createProjectCards() {
        const projectsContainer = document.getElementById('projects-container');

        repositories.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card';

            let languageHtml = '';
            if (repo.language) {
                languageHtml = `
                    <div class="project-language">
                        <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
                        ${repo.language}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="project-content">
                    <div class="project-title">
                        <h3>${repo.name}</h3>
                        <span style="font-size: 0.8rem; padding: 3px 8px; border-radius: 10px; background-color: ${repo.isPublic ? '#e3f2fd' : '#ffe0b2'}; color: ${repo.isPublic ? '#1565c0' : '#e65100'}">
                            ${repo.isPublic ? 'Public' : 'Private'}
                        </span>
                    </div>
                    ${languageHtml}
                    <p>${repo.description || "No description provided"}</p>
                    <div class="project-status">${repo.status}</div>
                    <div class="project-links">
                        <a href="#" class="view-project">
                            <i class="fas fa-external-link-alt"></i> View Project
                        </a>
                        <a href="#" class="github-link">
                            <i class="fab fa-github"></i> Code
                        </a>
                    </div>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    // Initialize project cards
    createProjectCards();

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });

    // Add scroll animation for elements
    function animateOnScroll() {
        const elements = document.querySelectorAll('.project-card, #about .about-content, #contact .contact-content');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Add initial styles for animation
    document.querySelectorAll('.project-card, #about .about-content, #contact .contact-content').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Call animation on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
});