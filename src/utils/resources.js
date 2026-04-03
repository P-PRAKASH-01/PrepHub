// Comprehensive mapping of technical skills to high-quality learning resources
export const skillResources = {
  // Programming Languages
  "JavaScript": [
    { type: "Course", title: "JavaScript Fundamentals", url: "https://javascript.info/", provider: "javascript.info" },
    { type: "Video", title: "JavaScript Crash Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", provider: "Traversy Media" },
    { type: "Docs", title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", provider: "MDN" }
  ],
  "Python": [
    { type: "Course", title: "Python for Everybody", url: "https://www.coursera.org/specializations/python", provider: "Coursera" },
    { type: "Video", title: "Python Tutorial for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", provider: "freeCodeCamp" },
    { type: "Docs", title: "Python Official Documentation", url: "https://docs.python.org/3/", provider: "Python.org" }
  ],
  "Java": [
    { type: "Course", title: "Java Programming and Software Engineering", url: "https://www.coursera.org/specializations/java-programming", provider: "Coursera" },
    { type: "Video", title: "Java Tutorial for Beginners", url: "https://www.youtube.com/watch?v=eIrMbAQSU34", provider: "Programming with Mosh" },
    { type: "Docs", title: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/", provider: "Oracle" }
  ],
  "C++": [
    { type: "Course", title: "C++ For C Programmers", url: "https://www.coursera.org/learn/c-plus-plus-a", provider: "Coursera" },
    { type: "Video", title: "C++ Tutorial for Beginners", url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", provider: "freeCodeCamp" },
    { type: "Docs", title: "C++ Reference", url: "https://en.cppreference.com/w/", provider: "cppreference.com" }
  ],
  "TypeScript": [
    { type: "Course", title: "Understanding TypeScript", url: "https://www.udemy.com/course/understanding-typescript/", provider: "Udemy" },
    { type: "Video", title: "TypeScript Crash Course", url: "https://www.youtube.com/watch?v=BCg4U1FzODs", provider: "Traversy Media" },
    { type: "Docs", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", provider: "TypeScript" }
  ],

  // Web Technologies
  "React": [
    { type: "Course", title: "React - The Complete Guide", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", provider: "Udemy" },
    { type: "Video", title: "React Tutorial for Beginners", url: "https://www.youtube.com/watch?v=SqcY0GlETPk", provider: "freeCodeCamp" },
    { type: "Docs", title: "React Documentation", url: "https://react.dev/", provider: "React" }
  ],
  "Node.js": [
    { type: "Course", title: "Node.js, Express, MongoDB & More", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", provider: "Udemy" },
    { type: "Video", title: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", provider: "Traversy Media" },
    { type: "Docs", title: "Node.js Documentation", url: "https://nodejs.org/en/docs/", provider: "Node.js" }
  ],
  "HTML": [
    { type: "Course", title: "HTML and CSS for Beginners", url: "https://www.youtube.com/watch?v=mU6anWqZJcc", provider: "Kevin Powell" },
    { type: "Video", title: "HTML Full Course", url: "https://www.youtube.com/watch?v=pQN-pnXPaVg", provider: "freeCodeCamp" },
    { type: "Docs", title: "HTML MDN Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", provider: "MDN" }
  ],
  "CSS": [
    { type: "Course", title: "CSS - The Complete Guide", url: "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", provider: "Udemy" },
    { type: "Video", title: "CSS Crash Course", url: "https://www.youtube.com/watch?v=yfoY53QXEnI", provider: "Traversy Media" },
    { type: "Docs", title: "CSS MDN Docs", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", provider: "MDN" }
  ],

  // Databases
  "SQL": [
    { type: "Course", title: "SQL for Data Science", url: "https://www.coursera.org/learn/sql-for-data-science", provider: "Coursera" },
    { type: "Video", title: "SQL Tutorial for Beginners", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", provider: "freeCodeCamp" },
    { type: "Docs", title: "SQL Tutorial", url: "https://www.w3schools.com/sql/", provider: "W3Schools" }
  ],
  "MongoDB": [
    { type: "Course", title: "MongoDB for Developers", url: "https://university.mongodb.com/", provider: "MongoDB University" },
    { type: "Video", title: "MongoDB Crash Course", url: "https://www.youtube.com/watch?v=-56x56UppqQ", provider: "Traversy Media" },
    { type: "Docs", title: "MongoDB Documentation", url: "https://docs.mongodb.com/", provider: "MongoDB" }
  ],

  // Cloud & DevOps
  "AWS": [
    { type: "Course", title: "AWS Certified Solutions Architect", url: "https://aws.amazon.com/training/learn-about/architect/", provider: "AWS" },
    { type: "Video", title: "AWS Crash Course", url: "https://www.youtube.com/watch?v=ulprqHHWlng", provider: "freeCodeCamp" },
    { type: "Docs", title: "AWS Documentation", url: "https://docs.aws.amazon.com/", provider: "AWS" }
  ],
  "Docker": [
    { type: "Course", title: "Docker for Beginners", url: "https://docker-curriculum.com/", provider: "Prakhar Srivastav" },
    { type: "Video", title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", provider: "TechWorld with Nana" },
    { type: "Docs", title: "Docker Documentation", url: "https://docs.docker.com/", provider: "Docker" }
  ],
  "Kubernetes": [
    { type: "Course", title: "Kubernetes for the Absolute Beginners", url: "https://www.udemy.com/course/learn-kubernetes/", provider: "Udemy" },
    { type: "Video", title: "Kubernetes Crash Course", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", provider: "TechWorld with Nana" },
    { type: "Docs", title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/", provider: "Kubernetes" }
  ],

  // Data Science & ML
  "Machine Learning": [
    { type: "Course", title: "Machine Learning by Andrew Ng", url: "https://www.coursera.org/learn/machine-learning", provider: "Coursera" },
    { type: "Video", title: "Machine Learning for Everybody", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg", provider: "Simplilearn" },
    { type: "Docs", title: "Scikit-learn Documentation", url: "https://scikit-learn.org/stable/", provider: "Scikit-learn" }
  ],
  "Data Analysis": [
    { type: "Course", title: "Google Data Analytics", url: "https://www.coursera.org/professional-certificates/google-data-analytics", provider: "Coursera" },
    { type: "Video", title: "Data Analysis with Python", url: "https://www.youtube.com/watch?v=r-uOLxNrNk8", provider: "freeCodeCamp" },
    { type: "Docs", title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", provider: "Pandas" }
  ],

  // Tools & Frameworks
  "Git": [
    { type: "Course", title: "Version Control with Git", url: "https://www.coursera.org/learn/version-control-with-git", provider: "Coursera" },
    { type: "Video", title: "Git Tutorial for Beginners", url: "https://www.youtube.com/watch?v=8JJ101D3knE", provider: "freeCodeCamp" },
    { type: "Docs", title: "Git Documentation", url: "https://git-scm.com/doc", provider: "Git" }
  ],
  "REST APIs": [
    { type: "Course", title: "REST APIs with Flask and Python", url: "https://www.udemy.com/course/rest-api-flask-and-python/", provider: "Udemy" },
    { type: "Video", title: "REST API Crash Course", url: "https://www.youtube.com/watch?v=Q-BpqyOT3a8", provider: "Traversy Media" },
    { type: "Docs", title: "REST API Tutorial", url: "https://restfulapi.net/", provider: "RESTful API" }
  ]
};

// Helper function to get resources for a specific skill
export function getResourcesForSkill(skill) {
  return skillResources[skill] || [];
}

// Helper function to get all skills that have resources
export function getAllSkillsWithResources() {
  return Object.keys(skillResources);
}