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

  const replaceHtmlTags = (str) => {
    return str
      .replace(/<h1>(.*?)<\/h1>/g, '# $1') 
      .replace(/<b>(.*?)<\/b>/g, '*$1*') 
      .replace(/<strong>(.*?)<\/strong>/g, '*$1*') 
      .replace(/<i>(.*?)<\/i>/g, '_$1_') 
      .replace(/<em>(.*?)<\/em>/g, '_$1_') 
      .replace(/<u>(.*?)<\/u>/g, '~$1~') 
      .replace(/<mark>(.*?)<\/mark>/g, '==$1==') 
      .replace(/<del>(.*?)<\/del>/g, '~~$1~~') 
      .replace(/<ins>(.*?)<\/ins>/g, '++$1++') 
      .replace(/<sub>(.*?)<\/sub>/g, 'ₛ$1') 
      .replace(/<sup>(.*?)<\/sup>/g, 'ⁿ$1') 
      .replace(/&/g, "&amp;")    
      .replace(/</g, "&lt;")     
      .replace(/>/g, "&gt;")   
      .replace(/"/g, "&quot;")   
      .replace(/'/g, "&#039;");   
  };
  
  const postsHTML = posts.map((post, index) => `
  
  <li class="post">
                    <div class="post-header" data-user-id="${post.user.id}">
                        <img src="${post.user.imageUrl}" class="post-header__user-image">
                        <p class="post-header__user-name">${replaceHtmlTags(post.user.name)}</p>
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
                       `<strong>${replaceHtmlTags(post.likes[0].name)}</strong>` : 
                        post.likes.length > 1 ? 
                      `<strong>${replaceHtmlTags(post.likes[post.likes.length - 1].name)}</strong> и ещё <strong>${post.likes.length - 1}</strong>` : 
                       '0'}
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${replaceHtmlTags(post.user.name)}</span>
                      ${replaceHtmlTags(post.description)}
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
                ${isSingleMode?`<p class="user-posts-title">Посты ${replaceHtmlTags(author)}</p>`:""}
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