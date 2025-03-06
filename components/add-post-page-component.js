import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick, user }) {
  let imageUrl;
  
  const render = () => {
    // @TODO: Реализовать страницу добавления поста
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="form">
         <h3 class="form-title">Добавление нового поста</h3>
          <div class="form-inputs">
           <div class="upload-image-container"></div>
           <input type="text" id="desc-input" class="input" placeholder="Описание поста" />
           <div class="form-error"></div>
           </div>
      <button class="button" id="add-button">Добавить</button>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: appEl.querySelector(".header-container"),
      user,
      
    });

    renderUploadImageComponent({
      element: appEl.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert("Добавьте картинку");
      }

      const description = document.getElementById("desc-input").value;
      if (!description) {
        alert("Введите описание картинки");
      }

      onAddPostClick({
        description,
        imageUrl,
      });
    });
  };

  render();
}
