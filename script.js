document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const jokeSetup = document.getElementById("joke-setup");
  const jokeDelivery = document.getElementById("joke-delivery");
  const nextJokeButton = document.getElementById("next-joke-btn");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const recentJokesList = document.getElementById("joke-history");
  const revealButton = document.getElementById("reveal-btn");
  const jokeSeparator = document.getElementById("joke-separator");
  const jokeRevealContainer = document.getElementById("joke-reveal-container");
  const jokeCard = document.getElementById("joke-card");
  const loaderContainer = document.getElementById("loader");
  const errorMessage = document.getElementById("error-message");
  const tryAgainButton = document.getElementById("try-again-btn");
  const favoritesContainer = document.getElementById("favorites-container");
  const noFavorites = document.getElementById("no-favorites");
  const discoverJokesButton = document.getElementById("discover-jokes-btn");
  const favoritesCount = document.getElementById("favorites-count");
  const favoriteButton = document.getElementById("favorite-btn");
  const copyButton = document.getElementById("copy-btn");
  const shareButton = document.getElementById("share-btn");
  const funnyButton = document.getElementById("funny-btn");
  const notFunnyButton = document.getElementById("not-funny-btn");
  const toast = document.getElementById("toast");
  const toastTitle = document.getElementById("toast-title");
  const toastDescription = document.getElementById("toast-description");
  const toastIcon = document.getElementById("toast-icon");
  const themeSwitch = document.getElementById("theme-switch");
  const tabButtons = document.querySelectorAll(".tab-btn");

  // Variables
  let currentCategory = "Any";
  let recentJokes = JSON.parse(localStorage.getItem("recentJokes")) || [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Update favorites count
  function updateFavoritesCount() {
    favoritesCount.textContent = `(${favorites.length})`;
  }

  // Show toast
  function showToast(title, description, iconClass) {
    toastTitle.textContent = title;
    toastDescription.textContent = description;
    toastIcon.className = iconClass;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Fetch joke from API
  function fetchJoke() {
    loaderContainer.style.display = "flex";
    jokeCard.style.display = "none";
    errorMessage.style.display = "none";

    const xhr = new XMLHttpRequest();
    const url = `https://v2.jokeapi.dev/joke/${currentCategory}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;

    xhr.open("GET", url, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        displayJoke(response);
        addToRecentJokes(response);
      } else {
        showError();
      }
    };

    xhr.onerror = function () {
      showError();
    };

    xhr.send();
  }

  // Display joke
  function displayJoke(joke) {
    loaderContainer.style.display = "none";
    jokeCard.style.display = "block";

    if (joke.type === "twopart") {
      jokeSetup.textContent = joke.setup;
      jokeDelivery.textContent = "";
      jokeRevealContainer.style.display = "block";
      jokeSeparator.style.display = "none";
    } else {
      jokeSetup.textContent = joke.joke;
      jokeDelivery.textContent = "";
      jokeRevealContainer.style.display = "none";
      jokeSeparator.style.display = "none";
    }

    // Update category emoji and text
    const categoryEmoji = document.getElementById("joke-category-emoji");
    const categoryText = document.getElementById("joke-category-text");
    categoryEmoji.textContent = getCategoryEmoji(joke.category);
    categoryText.textContent = joke.category || "Any";

    // Reset reveal button
    revealButton.textContent = "Reveal Punchline";
    revealButton.disabled = false;
  }

  // Add joke to recent jokes
  function addToRecentJokes(joke) {
    joke.category = currentCategory; // Add category to the joke object
    recentJokes.unshift(joke);
    if (recentJokes.length > 5) {
      recentJokes.pop();
    }
    localStorage.setItem("recentJokes", JSON.stringify(recentJokes));
    updateRecentJokesList();
  }

  // Update recent jokes list
  function updateRecentJokesList() {
    recentJokesList.innerHTML = "";
    const filteredJokes = recentJokes.filter(
      (joke) => joke.category === currentCategory
    );

    if (filteredJokes.length === 0) {
      recentJokesList.innerHTML = `<p class="no-recent-jokes">No recent jokes in this category.</p>`;
      return;
    }

    filteredJokes.forEach((joke) => {
      const jokeItem = document.createElement("div");
      jokeItem.className = "history-card";
      jokeItem.innerHTML = `
          <div class="history-card-header">
            <div class="history-card-category">
              <span class="emoji">${getCategoryEmoji(joke.category)}</span>
              <span>${joke.category || "Any"}</span>
            </div>
          </div>
          <div class="history-card-content">
            <p>${joke.setup || joke.joke}</p>
          </div>
        `;
      recentJokesList.appendChild(jokeItem);
    });
  }

  // Update favorites list
  function updateFavoritesList() {
    favoritesContainer.innerHTML = "";
    if (favorites.length === 0) {
      noFavorites.style.display = "block";
      favoritesContainer.style.display = "none";
    } else {
      noFavorites.style.display = "none";
      favoritesContainer.style.display = "block";
      favorites.forEach((joke) => {
        const favoriteItem = document.createElement("div");
        favoriteItem.className = "favorite-card";
        favoriteItem.innerHTML = `
            <div class="favorite-card-header">
              <div class="favorite-card-category">
                <span class="emoji">${getCategoryEmoji(joke.category)}</span>
                <span>${joke.category || "Any"}</span>
              </div>
            </div>
            <div class="favorite-card-content">
              <p>${joke.setup || joke.joke}</p>
            </div>
          `;
        favoritesContainer.appendChild(favoriteItem);
      });
    }
  }

  // Get category emoji
  function getCategoryEmoji(category) {
    switch (category) {
      case "Programming":
        return "👨‍💻";
      case "Misc":
        return "🎭";
      case "Pun":
        return "🤣";
      case "Spooky":
        return "👻";
      case "Christmas":
        return "🎅";
      default:
        return "😂";
    }
  }

  // Show error message
  function showError() {
    loaderContainer.style.display = "none";
    errorMessage.style.display = "block";
  }

  // Toggle dark/light mode
  function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  }

  // Event Listeners
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.getAttribute("data-category");
      fetchJoke();
      updateRecentJokesList();
    });
  });

  nextJokeButton.addEventListener("click", fetchJoke);

  revealButton.addEventListener("click", function () {
    jokeDelivery.textContent = joke.delivery;
    jokeSeparator.style.display = "block";
    revealButton.textContent = "Punchline Revealed!";
    revealButton.disabled = true;
  });

  favoriteButton.addEventListener("click", function () {
    const currentJoke = recentJokes[0];
    const isFavorite = favorites.some((fav) => fav.id === currentJoke.id);

    if (isFavorite) {
      favorites = favorites.filter((fav) => fav.id !== currentJoke.id);
      showToast(
        "Removed from Favorites",
        "Joke removed from your favorites",
        "fas fa-bookmark"
      );
    } else {
      favorites.push(currentJoke);
      showToast(
        "Added to Favorites",
        "Joke saved to your favorites",
        "fas fa-bookmark-check"
      );
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesCount();
    updateFavoritesList();
  });

  copyButton.addEventListener("click", function () {
    const jokeText = jokeSetup.textContent + " " + jokeDelivery.textContent;
    navigator.clipboard.writeText(jokeText);
    showToast(
      "Copied to Clipboard",
      "Joke copied to your clipboard",
      "fas fa-copy"
    );
  });

  shareButton.addEventListener("click", function () {
    const jokeText = jokeSetup.textContent + " " + jokeDelivery.textContent;
    if (navigator.share) {
      navigator.share({
        title: "Check out this joke!",
        text: jokeText,
      });
    } else {
      navigator.clipboard.writeText(jokeText);
      showToast(
        "Link Copied",
        "Joke link copied to clipboard",
        "fas fa-share-alt"
      );
    }
  });

  funnyButton.addEventListener("click", function () {
    showToast("Funny!", "You found this joke funny!", "fas fa-thumbs-up");
  });

  notFunnyButton.addEventListener("click", function () {
    showToast(
      "Not Funny",
      "You didn't find this joke funny.",
      "fas fa-thumbs-down"
    );
  });

  tryAgainButton.addEventListener("click", fetchJoke);

  discoverJokesButton.addEventListener("click", function () {
    document.querySelector(".tab-btn[data-tab='new-jokes']").click();
  });

  themeSwitch.addEventListener("change", toggleTheme);

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      const tab = this.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.display = "none";
      });
      document.getElementById(tab).style.display = "block";

      if (tab === "favorites") {
        updateFavoritesList();
      } else if (tab === "new-jokes") {
        updateRecentJokesList();
      }
    });
  });

  // Initialize
  fetchJoke();
  updateFavoritesCount();

  // Set theme from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  }
});
function updateRecentJokesList() {
  recentJokesList.innerHTML = "";
  const filteredJokes = recentJokes.filter(
    (joke) => joke.category === currentCategory
  );

  if (filteredJokes.length === 0) {
    recentJokesList.innerHTML = `<p class="no-recent-jokes">No recent jokes in this category.</p>`;
    return;
  }

  filteredJokes.forEach((joke) => {
    const jokeItem = document.createElement("div");
    jokeItem.className = "recent-joke-item";
    jokeItem.innerHTML = `
        <div class="recent-joke-content">
          <p class="recent-joke-text">${joke.setup || joke.joke}</p>
          <p class="recent-joke-category">
            <span class="emoji">${getCategoryEmoji(joke.category)}</span>
            ${joke.category || "Any"}
          </p>
        </div>
      `;
    recentJokesList.appendChild(jokeItem);
  });
}
