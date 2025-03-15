import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, renderApp } from "../index.js";
import { toggleLike } from "../api.js"
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function renderPostsPageComponent({ appEl, user, isSingleMode=false }) {
  
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  };

  const removeHtmlTags = (str) => str.replace(/<[^>]*>/g, '');
  
  const postsHTML = posts.map((post, index) => `
  
  <li class="post">
                    <div class="post-header" data-user-id="${post.user.id}">
                        <img src="${post.user.imageUrl}" class="post-header__user-image">
                        <p class="post-header__user-name">${removeHtmlTags(post.user.name)}</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src="${post.imageUrl}">
                    </div>
                    <div class="post-likes">
                      <button data-index="${index}" data-post-id="${post.id}" class="like-button">
                        <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}" class="like-image">
                      </button>
                      <p class="post-likes-text">
                       Нравится: ${post.likes.length === 1 ? 
                       `<strong>${removeHtmlTags(post.likes[0].name)}</strong>` : 
                        post.likes.length > 1 ? 
                      `<strong>${removeHtmlTags(post.likes[post.likes.length - 1].name)}</strong> и ещё <strong>${post.likes.length - 1}</strong>` : 
                       '0'}
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${removeHtmlTags(post.user.name)}</span>
                      ${removeHtmlTags(post.description)}
                    </p>
                    <p class="post-date">
                    ${formatDate(post.createdAt)}
                    </p>
                  </li>
  
  `).join('');

  const author=posts[0].user.name
  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                ${isSingleMode?`<p class="user-posts-title">Посты ${removeHtmlTags(author)}</p>`:""}
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
      // Получаем токен пользователя
      const userToken = getToken();

      // Проверка на наличие токена
      if (!userToken) {
        alert("Лайкать посты могут только авторизованные пользователи");
        return;  // Прекращаем выполнение функции
      }

      // Выполняем запрос на изменение лайка
      const action = isLiked ? 'dislike' : 'like'; 
      try {
        const updatedPost = await toggleLike({ token: userToken, postId, event: action });
        post.isLiked = updatedPost.isLiked;
        post.likes = updatedPost.likes;

        renderApp();
      } catch (error) {
        alert("Произошла ошибка: " + error.message);
        
      }
    });
  });
}