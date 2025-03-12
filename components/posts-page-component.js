import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, renderApp } from "../index.js";
import { toggleLike } from "../api.js"
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function renderPostsPageComponent({ appEl, user, isSingleMode=false }) {
  
  console.log("Актуальный список постов:", posts);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  };
  /**
   * @TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const postsHTML = posts.map((post, index) => `
  <li class="post">
                    <div class="post-header" data-user-id="${post.user.id}">
                        <img src="${post.user.imageUrl}" class="post-header__user-image">
                        <p class="post-header__user-name">${post.user.name}</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src="${post.imageUrl}">
                    </div>
                    <div class="post-likes">
                      <button data-index="${index}" data-post-id="${post.id}" class="like-button">
                        <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}" class="like-image">
                      </button>
                      <p class="post-likes-text">
                        Нравится: <strong>${post.likes.length}</strong>
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${post.user.name}</span>
                      ${post.description}
                    </p>
                    <p class="post-date">
                    //${formatDate(post.createdAt)}
                    </p>
                  </li>
  
  `).join('');

  const author=posts[0].user.name
  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                ${isSingleMode?`<p class="user-posts-title">Посты ${author}</p>`:""}
                <ul class="posts">
                 ${postsHTML}
                  
              </ul>
              </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    user,
    goToPage
    
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  document.querySelectorAll(".like-button").forEach(button => {
    button.addEventListener("click", async (event) => {
      const postId = button.getAttribute("data-post-id");
       
      
      // Получаем текущее состояние лайка

      const isLiked = button.querySelector(".like-image").src.includes("like-active");

      const postIndex = button.dataset.index;
      

      const post=posts[postIndex]
      // Выполняем запрос на изменение лайка
      const action = isLiked ? 'dislike' : 'like'; 
      const updatedPost = await toggleLike({ token: getToken(), postId, event: action });
      post.isLiked = updatedPost.isLiked
      post.likes = updatedPost.likes

      renderApp();
      
    });
  });
}



