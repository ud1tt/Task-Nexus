# Modular Task Nexus (MTN)

## Overview

Modular Task Nexus is a dynamic, single-page project management application built from the ground up with vanilla JavaScript. Designed to go beyond the limitations of a simple to-do list, this application provides a robust interface for managing complex, interconnected tasks with a rich feature set, including hierarchical sub-tasking, file attachments with previews, and a multi-view UI.

---

## Key Features

This project was built to demonstrate a deep understanding of core web technologies and client-side application state management.

* **Dynamic Multi-View Interface:** Users can instantly switch between a visual **Grid View** and a structured **Table View** to manage their tasks in the format that best suits their workflow.

* **Hierarchical Task Management:**
    * **Parent-Child Relationships:** Create complex project structures by adding sub-tasks to any parent task.
    * **Cascading Deletes:** Deleting a parent task intelligently triggers a soft delete for all its children, maintaining data integrity.
    * **Parent Linking:** Sub-tasks feature a clickable link back to their parent, making navigation through complex hierarchies seamless.

* **Rich Task Details:**
    * **File Attachments:** Attach multiple files to any task. The system generates live previews with thumbnails for images and distinct icons for documents like PDFs.
    * **Notifications:** A real-time notification system keeps users informed of all key actions, such as task creation, updates, and deletions.

* **Powerful Data Management:**
    * **Client-Side Persistence:** All task data, including relationships and attachments, is saved in the browser's `localStorage`, ensuring user data persists between sessions.
    * **Dynamic Filtering & Search:** A powerful filtering sidebar allows users to sort and find tasks based on status, date range, or a full-text search of titles and descriptions.
    * **Soft & Permanent Deletes:** Tasks can be soft-deleted with a reason, which can be reviewed later, or permanently removed from the system.

---

## Tech Stack

This project was built entirely with foundational web technologies to showcase core development skills without reliance on a front-end framework.

* **JavaScript (ES6+):** All application logic, state management, and DOM manipulation are handled with modern, object-oriented JavaScript.
* **HTML5:** Structured and semantic markup for the application layout.
* **CSS3:** Custom styling for a clean, modern, and responsive user interface, including variables for theming.
* **LocalStorage API:** Used for all client-side data persistence.
* **FileReader API:** Implemented for handling asynchronous file uploads and generating attachment previews.

---

## How to Run Locally

Since this is a vanilla JavaScript project, no build tools are required.

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd [repository-folder-name]
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser to run the application.

---
