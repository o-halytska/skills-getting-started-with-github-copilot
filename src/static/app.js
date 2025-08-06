document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants section safely
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants:";
        participantsSection.appendChild(participantsLabel);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          details.participants.forEach(email => {
            const li = document.createElement("li");
            li.className = "participant-item";
            // Email span
            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;
            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant";
            deleteBtn.title = "Remove participant";
            deleteBtn.innerHTML = "&#128465;"; // Trash can icon
            deleteBtn.addEventListener("click", async (e) => {
              e.stopPropagation();
              if (!confirm(`Remove ${email} from ${name}?`)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "DELETE",
                });
                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "success";
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "Failed to remove participant.";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
              } catch (error) {
                messageDiv.textContent = "Failed to remove participant.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                console.error("Error removing participant:", error);
              }
            });
            li.appendChild(emailSpan);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });
          participantsSection.appendChild(ul);
        } else {
          const span = document.createElement("span");
          span.className = "no-participants";
          span.textContent = "No participants yet";
          participantsSection.appendChild(span);
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
