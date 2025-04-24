// Skill data for icon display
const skillData = {
  programming: [
    {
      name: "Python",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    },
    {
      name: "C++",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    },
    {
      name: "C",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    },
    {
      name: "SQL",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    },
    {
      name: "PHP",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
    },
  ],
  frameworks: [
    {
      name: "OpenCV",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",
    },
    {
      name: "PyTorch",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
    },
    {
      name: "TensorFlow",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
    },
    {
      name: "Scikit-learn",
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",
    },
    {
      name: "NumPy",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
    },
    {
      name: "Pandas",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
    },
    {
      name: "Docker",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    },
    {
      name: "GitHub",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    },
    {
      name: "Grad-CAM",
      icon: "https://img.icons8.com/external-flat-icons-inmotus-design/67/null/external-cam-computer-vision-flat-icons-inmotus-design.png",
    },
    {
      name: "Arduino",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg",
    },
    {
      name: "Jetson Nano",
      icon: "https://cdn-icons-png.flaticon.com/512/9066/9066589.png", // Placeholder icon
    },
  ],
  tools: [
    {
      name: "Git",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    },
    {
      name: "VSCode",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    },
    {
      name: "Jupyter",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",
    },
  ],
  softskills: [
    {
      name: "Team Collaboration",
      icon: "https://img.icons8.com/color/96/teamwork--v1.png",
    },
    {
      name: "Problem Solving",
      icon: "https://img.icons8.com/color/96/solution.png",
    },
    {
      name: "Leadership",
      icon: "https://img.icons8.com/color/96/leadership.png",
    },
    {
      name: "Social Connection",
      icon: "https://img.icons8.com/color/96/group-background-selected.png",
    },
  ],
};




function initializeTerminal() {
  setTimeout(function () {
    const terminalCommands = [
      {
        command: "ls -la skills/",
        output:
          "total 16<br>drwxr-xr-x  4 apurv apurv 4096 Oct 5 10:23 .<br>drwxr-xr-x 15 apurv apurv 4096 Oct 5 10:23 ..<br>drwxr-xr-x  4 apurv apurv 4096 Oct 5 10:23 programming<br>drwxr-xr-x  4 apurv apurv 4096 Oct 5 10:23 frameworks<br>drwxr-xr-x  4 apurv apurv 4096 Oct 5 10:23 tools<br>drwxr-xr-x  4 apurv apurv 4096 Oct 5 10:23 softskills",
        skillCategory: null,
      },
      {
        command: "cd programming && ls -la",
        output:
          "total 4<br>drwxr-xr-x 4 apurv apurv 4096 Oct 5 10:23 .<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 python.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 cpp.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 c.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 sql.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 php.md",
        skillCategory: "programming",
      },
      {
        command: "cd ../frameworks && ls -la",
        output:
          "total 4<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 opencv.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 pytorch.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 tensorflow.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 sklearn.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 numpy.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 pandas.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 github.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 docker.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 grad-cam.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 arduino.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 jetsonnano.md",
        skillCategory: "frameworks",
      },
      {
        command: "cd ../tools && ls -la",
        output:
          "total 4<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 git.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 vscode.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 jupyter.md",
        skillCategory: "tools",
      },
      {
        command: "cd ../softskills && ls -la",
        output:
          "total 4<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 teamwork.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 problemsolving.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 leadership.md<br>-rw-r--r-- 1 apurv apurv   0 Oct 5 10:23 socialconnection.md",
        skillCategory: "softskills",
      },
    ];

    let currentCommandIndex = 0;
    const terminalCommand = document.getElementById("terminal-command");
    const terminalOutput = document.getElementById("terminal-output");
    const skillsContainer = document.getElementById("skills-container");

    // Clear previous content
    terminalOutput.innerHTML = "";
    skillsContainer.innerHTML = "";

    function typeCommand(command, callback) {
      let i = 0;
      terminalCommand.textContent = "";
      const interval = setInterval(function () {
        terminalCommand.textContent += command[i];
        i++;
        if (i >= command.length) {
          clearInterval(interval);
          setTimeout(callback, 500);
        }
      }, 50);
    }

    function showOutput(output, skillCategory) {
      const fullCommand = document.createElement("div");
      fullCommand.innerHTML = `<span class="terminal-user">apurv@mac</span><span class="terminal-prompt">~ % </span>${terminalCommand.textContent}`;
      fullCommand.classList.add("highlight");
      terminalOutput.appendChild(fullCommand);

      setTimeout(function () {
        const outputElement = document.createElement("div");
        outputElement.innerHTML = output;
        terminalOutput.appendChild(outputElement);
        terminalCommand.textContent = "";

        if (skillCategory && skillData[skillCategory]) {
          displaySkillCategory(skillCategory);
        }

        const terminal = document.querySelector(".terminal");
        terminal.scrollTop = terminal.scrollHeight;

        currentCommandIndex++;
        if (currentCommandIndex < terminalCommands.length) {
          setTimeout(function () {
            typeCommand(
              terminalCommands[currentCommandIndex].command,
              function () {
                showOutput(
                  terminalCommands[currentCommandIndex].output,
                  terminalCommands[currentCommandIndex].skillCategory
                );
              }
            );
          }, 1000);
        }
      }, 300);
    }

    function displaySkillCategory(category) {
      if (!document.getElementById(`${category}-section`)) {
        const categoryTitle =
          category.charAt(0).toUpperCase() + category.slice(1);

        const section = document.createElement("div");
        section.id = `${category}-section`;
        section.classList.add("mb-8");

        section.innerHTML = `
            <h3 class="text-xl font-bold mb-4">${categoryTitle}</h3>
            <div id="${category}-grid" class="skill-grid"></div>
        `;

        skillsContainer.appendChild(section);

        const grid = document.getElementById(`${category}-grid`);
        skillData[category].forEach((skill, index) => {
          setTimeout(() => {
            const skillItem = document.createElement("div");
            skillItem.classList.add(
              "skill-item",
              "animate__animated",
              "animate__fadeIn"
            );
            skillItem.innerHTML = `
              <img src="${skill.icon}" alt="${skill.name}" class="skill-icon">
              <div class="skill-name">${skill.name}</div>
            `;
            grid.appendChild(skillItem);
          }, index * 200);
        });
      }
    }

    // Start terminal animation
    typeCommand(terminalCommands[0].command, function () {
      showOutput(terminalCommands[0].output, terminalCommands[0].skillCategory);
    });
  }, 500);
}


// Boot Animation
document.addEventListener("DOMContentLoaded", function () {
  const bootScreen = document.getElementById("boot-screen");
  const bootProgressBar = document.getElementById("boot-progress-bar");
  const bootSound = document.getElementById("boot-sound");

  // Play boot sound
  bootSound.play();

  // Animate progress bar
  setTimeout(function () {
    bootProgressBar.style.width = "100%";
  }, 500);

  // Hide boot screen after animation
  setTimeout(function () {
    bootScreen.style.opacity = "0";
    setTimeout(function () {
      bootScreen.style.display = "none";
    }, 1000);
  }, 3500);
});

// Navigation
document.querySelectorAll(".sidebar-link, .menu-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    // Remove active class from all links
    document
      .querySelectorAll(".sidebar-link, .menu-link")
      .forEach((l) => l.classList.remove("active"));

    // Add active class to clicked link
    this.classList.add("active");

    // Hide all sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.add("hidden");
    });

    // Show corresponding section
    const sectionId = this.getAttribute("data-section");
    document.getElementById(sectionId).classList.remove("hidden");

    // Initialize terminal animation if skills section is shown
    if (sectionId === "skills") {
      initializeTerminal();
    }
  });
});

// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
});



// Project Details
const projectItems = document.querySelectorAll(".project-item");
const projectModal = document.getElementById("project-detail-modal");
const projectModalOverlay = document.getElementById("project-modal-overlay");
const closeProjectModal = document.getElementById("close-project-modal");
const projectModalTitle = document.getElementById("project-modal-title");
const projectModalContent = document.getElementById("project-modal-content");

// Project data
const projectData = {
  charusat: {
    title: "CHARUSAT-Saarthi-Campus-Path-Navigator",
    description:
      "A campus navigation system designed for CHARUSAT University to help visitors and new students find their way around the campus. The system uses computer vision techniques and path-finding algorithms to provide efficient navigation routes throughout the campus.",
    features: [
      "Interactive 3D campus map with detailed building information",
      "Real-time navigation with step-by-step directions",
      "Landmark recognition using computer vision",
      "Classroom and faculty office locator",
      "Event calendar integration",
    ],
    technologies: [
      "Python",
      "Computer Vision",
      "Path Finding Algorithms",
      "Mobile App Development",
    ],
    challenges:
      "One of the major challenges was accurately mapping the indoor environments and ensuring reliable path generation even in areas with poor GPS signals. We implemented a hybrid approach combining GPS, WiFi triangulation, and visual landmarks for more accurate positioning.",
  },
  guardeye: {
    title: "GuardEye-AI-Powered-Theft-Detection-System",
    description:
      "An advanced security system that uses AI and computer vision to detect potential theft or suspicious activities in retail environments and other public spaces.",
    features: [
      "Real-time suspicious behavior detection",
      "Person tracking across multiple cameras",
      "Instant alerts to security personnel",
      "Historical data analysis for security insights",
      "Low false-positive rate using advanced AI algorithms",
    ],
    technologies: [
      "Python",
      "TensorFlow",
      "OpenCV",
      "YOLO Object Detection",
      "Flask",
    ],
    challenges:
      "The main challenge was reducing false positives while maintaining high detection accuracy. We implemented a multi-stage verification process that significantly improved system reliability.",
  },
  lumbar: {
    title: "Lumbar-Spine-Detection-Using-YOLOv11",
    description:
      "A medical imaging project designed to automatically detect and analyze lumbar spine structures in X-ray and MRI images to assist radiologists and orthopedic surgeons in diagnosis.",
    features: [
      "Automatic detection of vertebrae and intervertebral discs",
      "Measurement of spine curvature and disc spacing",
      "Abnormality highlighting",
      "Integration with medical imaging systems",
      "Report generation",
    ],
    technologies: [
      "Python",
      "YOLOv11",
      "PyTorch",
      "Medical Image Processing",
      "DICOM Standards",
    ],
    challenges:
      "The varying quality of medical images and different imaging protocols presented significant challenges. We implemented adaptive preprocessing techniques to normalize image quality before detection.",
  },
  whatsappChatAnalyzer: {
    title: "WhatsApp Chat Analyzer",
    description:
      "A data-driven analytics tool that provides professional insights into messaging patterns, sentiment trends, and communication frequency within WhatsApp chats.",
    features: [
      "Message frequency heatmaps and timelines",
      "Sentiment analysis using transformer models",
      "Word cloud and emoji usage breakdown",
      "User comparison and group statistics",
      "Used by 100+ individuals for chat insights",
    ],
    technologies: [
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Data Visualization",
      "BERT Transformer",
    ],
    challenges:
      "The key challenge was delivering accurate sentiment analysis on informal text with mixed language. We fine-tuned a BERT-based model to adapt to real-world WhatsApp chat nuances.",
  },
  aircraftPredictiveMaintenance: {
    title: "Predictive Maintenance for Aircraft Engines",
    description:
      "A machine learning solution designed to predict the Remaining Useful Life (RUL) of aircraft engines, reducing operational costs and improving safety through timely maintenance.",
    features: [
      "RUL prediction with 92% model accuracy",
      "Early failure detection with alert triggers",
      "Reduced maintenance costs by 30%",
      "Supports real-time and batch inference",
      "Comprehensive visualization of engine health trends",
    ],
    technologies: [
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "Time Series Analysis",
      "Ensemble Methods",
    ],
    challenges:
      "The main challenge was handling sensor data degradation over time. We used robust ensemble techniques and temporal feature engineering to enhance the accuracy of long-term predictions.",
  },
pneumoGuard: {
    title: "PneumoGuard: Pneumonia Detection",
    description:
      "A research-driven deep learning model for detecting pneumonia from chest X-ray images, aimed at supporting faster and more accurate medical diagnostics.",
    features: [
      "87% accuracy in pneumonia detection",
      "Model ensemble for enhanced reliability",
      "Supports multiple CNN backbones (ResNet, VGG, Inception)",
      "Transformer-based image interpretation",
      "Improved diagnosis efficiency by 20%",
    ],
    technologies: [
      "PyTorch",
      "TensorFlow",
      "VGG16",
      "ResNet",
      "Inception",
      "Random Forest",
      "Vision Transformer",
      "Image Processing",
    ],
    challenges:
      "The primary challenge was improving model generalization across datasets with varied imaging quality. By incorporating transfer learning and model ensembles, we achieved high diagnostic precision.",
  },
  taskiverser: {
    title: "Taskiverse - To-Do List Manager",
    description:
      "A simple and efficient to-do list web application built to manage daily tasks with basic CRUD operations, designed for productivity and ease of use.",
    features: [
      "Create, Read, Update, and Delete tasks",
      "User-friendly interface with responsive design",
      "Task completion status toggle",
      "Clean and minimal layout for better focus",
      "Lightweight and fast-loading web app",
    ],
    technologies: [
      "PHP",
      "HTML",
      "CSS",
      "MySQL",
    ],
    challenges:
      "The primary challenge was implementing dynamic task updates using PHP without relying on JavaScript. Proper form handling and database interaction ensured a smooth task management experience.",
  },
  cppFileConsole: {
    title: "C++ File Management Console",
    description:
      "A custom-built file management system with its own console interface, developed entirely in C++. It allows users to manage files through commands like create, read, update, delete, and navigate directories — all from a handcrafted terminal UI.",
    features: [
      "Custom-designed console interface in C++",
      "File and folder creation, renaming, and deletion",
      "Directory navigation and structure visualization",
      "Basic file I/O operations (read/write)",
      "Command parsing engine for smooth user interaction",
    ],
    technologies: [
      "C++",
      "File Handling",
      "Object-Oriented Programming",
      "Console I/O",
      "System Calls",
    ],
    challenges:
      "The most challenging part was designing a functional and intuitive console interface from scratch using only C++ terminal commands. It required efficient parsing, low-level file handling, and a clear structure to simulate a real file system feel.",
  },
  
};

projectItems.forEach((item) => {
  item.addEventListener("click", function () {
    const projectId = this.getAttribute("data-project");
    const project = projectData[projectId] || {
      title: this.querySelector(".project-title").textContent,
      description: "Detailed information for this project is being updated.",
      features: ["Feature details coming soon"],
      technologies: ["Technology details coming soon"],
      challenges: "Challenge information is being updated.",
    };

    projectModalTitle.textContent = project.title;

    let content = `
                    <div class="bg-gray-900 text-white p-6 rounded-lg mb-6">
                        <p>${project.description}</p>
                    </div>
                    
                    <h3 class="text-xl font-bold mb-3">Key Features</h3>
                    <ul class="list-disc pl-6 mb-6">
                        ${project.features
                          .map((feature) => `<li class="mb-2">${feature}</li>`)
                          .join("")}
                    </ul>
                    
                    <h3 class="text-xl font-bold mb-3">Technologies Used</h3>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${project.technologies
                          .map(
                            (tech) =>
                              `<span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">${tech}</span>`
                          )
                          .join("")}
                    </div>
                    
                    <h3 class="text-xl font-bold mb-3">Challenges</h3>
                    <p>${project.challenges}</p>
                `;

    projectModalContent.innerHTML = content;

    projectModal.style.display = "block";
    projectModalOverlay.style.display = "block";
  });
});

closeProjectModal.addEventListener("click", function () {
  projectModal.style.display = "none";
  projectModalOverlay.style.display = "none";
});

projectModalOverlay.addEventListener("click", function () {
  projectModal.style.display = "none";
  projectModalOverlay.style.display = "none";
});

// Journey Tabs
const journeyTabs = document.querySelectorAll(".journey-tab");
journeyTabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    // Remove active class from all tabs
    journeyTabs.forEach((t) => {
      t.classList.remove("active", "bg-blue-500", "text-white");
      t.classList.add("bg-gray-200", "text-gray-700");
    });

    // Add active class to clicked tab
    this.classList.add("active", "bg-blue-500", "text-white");
    this.classList.remove("bg-gray-200", "text-gray-700");

    // Hide all content
    document
      .querySelectorAll(".timeline-content-container")
      .forEach((content) => {
        content.classList.add("hidden");
      });

    // Show corresponding content
    const tabId = this.getAttribute("data-tab");
    document.getElementById(`${tabId}-content`).classList.remove("hidden");
  });
});

// Certificate Modal
const certificateItems = document.querySelectorAll(".certificate-item");
const certificateModal = document.getElementById("certificate-modal");
const certModalOverlay = document.getElementById("cert-modal-overlay");
const closeCertModal = document.getElementById("close-cert-modal");
const certModalTitle = document.getElementById("cert-modal-title");
const certModalContent = document.getElementById("cert-modal-content");

const certificateData = {
  "stanford-ml": {
    title: "Machine Learning Specialization",
    issuer: "Stanford Online",
    date: "August 2024",
    description:
      "Covered supervised learning, unsupervised learning, best practices, and practical implementations of core machine learning concepts under the guidance of Prof. Andrew Ng.",
    image: "./Images/ml_specilization.png",
  },
  "nvidia-dl": {
    title: "Introduction to Deep Learning",
    issuer: "NVIDIA",
    date: "June 2024",
    description:
      "Introduced to foundational concepts in deep learning including neural networks, backpropagation, and GPU-accelerated model training using NVIDIA tools.",
    image: "./Images/deeplearning.png",
  },
  "jetson-nano": {
    title: "Getting Started with AI with Jetson Nano",
    issuer: "NVIDIA",
    date: "June 2024",
    description:
      "Hands-on training using NVIDIA Jetson Nano for edge AI development, covering object detection and real-time inference using deep learning models.",
    image: "./Images/jetson.png",
  },
  "redhat-linux": {
    title: "Fundamentals of Red Hat Linux",
    issuer: "Red Hat Academy",
    date: "May 2024",
    description:
      "Completed foundational training in Linux system operations, command-line usage, file system management, and user administration.",
    image: "./Images/redhat.png",
  },
  "dbms-nptel": {
    title: "Database Management System Certification",
    issuer: "NPTEL",
    date: "April 2024",
    description:
      "Focused on ER modeling, SQL, relational algebra, normalization, and transaction management in DBMS systems, guided by expert faculty from top IITs.",
    image: "./Images/dbms.png",
  },
  "ml-nptel": {
    title: "Machine Learning Certification",
    issuer: "NPTEL - IIT Madras",
    date: "March 2024",
    description:
      "Completed in-depth coursework in regression, classification, clustering, SVMs, and deep learning foundations, mentored by professors at IIT Madras.",
    image: "./Images/ml.png",
  },
  "python-crash": {
    title: "Python Crash Course",
    issuer: "Google + Coursera",
    date: "February 2024",
    description:
      "Completed beginner to intermediate level programming course focusing on Python fundamentals, functions, file handling, and automation tasks.",
    image: "./Images/python.png",
  },
};




certificateItems.forEach((item) => {
  item.addEventListener("click", function () {
    const certId = this.getAttribute("data-cert");
    const certificate = certificateData[certId] || {
      title: this.querySelector(".certificate-title").textContent,
      issuer: "Certificate Issuer",
      date: "Issue Date",
      description: "Certificate description is being updated.",
      image: this.querySelector(".certificate-img").src,
    };

    certModalTitle.textContent = certificate.title;

    let content = `
                    <div class="flex flex-col items-center mb-6">
                        <img src="${certificate.image}" alt="${certificate.title}" class="w-84 h-64 object-cover mb-4">
                        <h3 class="text-xl font-bold">${certificate.title}</h3>
                        <div class="text-gray-500">${certificate.issuer}</div>
                        <div class="text-sm text-gray-400">${certificate.date}</div>
                    </div>
                    
                    <div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                        <h4 class="font-bold mb-2">Description</h4>
                        <p>${certificate.description}</p>
                    </div>
                `;

    certModalContent.innerHTML = content;

    certificateModal.style.display = "block";
    certModalOverlay.style.display = "block";
  });
});

closeCertModal.addEventListener("click", function () {
  certificateModal.style.display = "none";
  certModalOverlay.style.display = "none";
});

certModalOverlay.addEventListener("click", function () {
  certificateModal.style.display = "none";
  certModalOverlay.style.display = "none";
});

// Initialize the theme
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersDarkScheme.matches) {
  document.body.classList.add("dark-mode");
  sunIcon.style.display = "none";
  moonIcon.style.display = "block";
} else {
  sunIcon.style.display = "none";
  moonIcon.style.display = "block";
}

document.getElementById("contactForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form submission

  // Change button text to indicate success
  const submitButton = document.getElementById("submitBtn");
  submitButton.innerHTML = "Message Sent Successfully!";
  
  // Optional: Reset the form after submission
  setTimeout(() => {
    document.querySelector(".contact-form").reset();
    submitButton.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
      </svg>
      Send Message
    `;
  }, 1000); // Reset button text after 2 seconds
});

