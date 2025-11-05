// Данные квиза
const quizData = {
  employmentType: "",
  specialties: [],
  employeeCount: {},
  duration: "",
};

// Функции для работы с ошибками
function showError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = "flex";
    if (elementId === "checkboxError") {
      errorElement.style.display = "block";
    }
  }
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

function hideAllErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.style.display = "none";
  });
}

// Функция для вывода данных в консоль (ТОЛЬКО ДЛЯ ФИНАЛЬНОГО ВЫВОДА)
function logQuizData() {
  console.log("📊 Данные квиза:", {
    employmentType: quizData.employmentType,
    specialties: quizData.specialties,
    employeeCount: quizData.employeeCount,
    duration: quizData.duration,
  });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  // Инициализация выпадающего списка
  initDropdown();

  // Инициализация радио-кнопок
  initRadioButtons();

  // Инициализация кнопок навигации
  initNavigationButtons();

  // Обновление прогресс-бара
  updateProgressBar(0);

  // Инициализация состояния кнопок
  updateNextButtonState(1);
});

// Функция для инициализации кнопок навигации
function initNavigationButtons() {
  // Кнопки "Далее" (кроме последней)
  document.querySelectorAll(".btn-next:not(.btn-submit)").forEach((button) => {
    button.addEventListener("click", function () {
      const currentQuestion = getCurrentQuestionNumber();
      if (currentQuestion) {
        nextQuestion(currentQuestion);
      }
    });
  });

  // Кнопки "Назад"
  document.querySelectorAll(".btn-prev").forEach((button) => {
    button.addEventListener("click", function () {
      const currentQuestion = getCurrentQuestionNumber();
      if (currentQuestion) {
        prevQuestion(currentQuestion);
      }
    });
  });

  // Кнопка "Получить предложение" в 4-м вопросе
  const submitButton = document.querySelector("#question4 .btn-next");
  if (submitButton) {
    submitButton.addEventListener("click", function () {
      nextQuestion(4);
    });
  }
}

// Функция для получения номера текущего вопроса
function getCurrentQuestionNumber() {
  const activeQuestion = document.querySelector(".question.active");
  if (activeQuestion) {
    const id = activeQuestion.id;
    return parseInt(id.replace("question", ""));
  }
  return null;
}

// Функция для проверки состояния кнопок "Далее"
function updateNextButtonState(questionNumber) {
  const nextButton = document.querySelector(
    `#question${questionNumber} .btn-next`
  );
  let isEnabled = true;

  switch (questionNumber) {
    case 1:
      const employmentTypeSelected = document.querySelector(
        'input[name="employment_type"]:checked'
      );
      isEnabled = !!employmentTypeSelected;
      break;
    case 2:
      isEnabled = quizData.specialties.length > 0;
      break;
    case 3:
      let totalCount = 0;
      for (const specialty in quizData.employeeCount) {
        totalCount += quizData.employeeCount[specialty];
      }
      isEnabled = totalCount > 0;
      break;
    case 4:
      const durationSelected = document.querySelector(
        'input[name="duration"]:checked'
      );
      isEnabled = !!durationSelected;
      break;
  }

  if (nextButton) {
    nextButton.disabled = !isEnabled;
  }
}

// Функция для инициализации радио-кнопок
function initRadioButtons() {
  const employmentRadios = document.querySelectorAll(
    'input[name="employment_type"]'
  );
  const durationRadios = document.querySelectorAll('input[name="duration"]');

  // Для типа трудоустройства
  employmentRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      employmentRadios.forEach((r) => {
        r.closest(".option").classList.remove("selected");
      });
      if (this.checked) {
        this.closest(".option").classList.add("selected");
        quizData.employmentType = this.value;
      }
      // Обновляем состояние кнопки после выбора
      updateNextButtonState(1);
    });
  });

  // Для продолжительности
  durationRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      durationRadios.forEach((r) => {
        r.closest(".option").classList.remove("selected");
      });
      if (this.checked) {
        this.closest(".option").classList.add("selected");
        quizData.duration = this.value;
      }
      // Обновляем состояние кнопки после выбора
      updateNextButtonState(4);
    });
  });
}

// Функция для инициализации выпадающего списка
function initDropdown() {
  const dropdown = document.getElementById("multiselectDropdown");
  const optionsContainer = document.getElementById("dropdownOptions");
  const options = optionsContainer.querySelectorAll(".dropdown-option");
  const selectedCount = document.getElementById("selectedCount");
  const selectedItems = document.getElementById("selectedItems");

  // Открытие/закрытие выпадающего списка
  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
    optionsContainer.classList.toggle("show");
    dropdown.classList.toggle("open");
  });

  // Выбор опции
  options.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      this.classList.toggle("selected");
      updateSelectedItems();
      // Обновляем состояние кнопки после выбора
      updateNextButtonState(2);
    });
  });

  // Закрытие выпадающего списка при клике вне его
  document.addEventListener("click", function () {
    optionsContainer.classList.remove("show");
    dropdown.classList.remove("open");
  });

  function updateSelectedItems() {
    const selectedOptions = optionsContainer.querySelectorAll(
      ".dropdown-option.selected"
    );
    const count = selectedOptions.length;

    // Обновление счетчика
    selectedCount.textContent = `Выбрано: ${count} сотрудников`;

    // Обновление текста в дропдауне
    if (count === 0) {
      dropdown.textContent = "Выберите специальности";
    } else {
      const selectedValues = Array.from(selectedOptions).map((opt) =>
        opt.getAttribute("data-value")
      );
      dropdown.textContent = selectedValues.join(", ");
    }

    // Обновление тегов выбранных элементов
    updateSelectedTags(selectedOptions);

    // Сохраняем выбранные специальности в данных квиза
    quizData.specialties = Array.from(selectedOptions).map((option) =>
      option.getAttribute("data-value")
    );

    // Если мы на 3-м шаге, обновляем отображение счетчиков
    if (document.getElementById("question3").classList.contains("active")) {
      renderSpecialtiesWithCounters();
    }
  }

  function updateSelectedTags(selectedOptions) {
    selectedItems.innerHTML = "";
    selectedOptions.forEach((option) => {
      const value = option.getAttribute("data-value");
      const tag = document.createElement("div");
      tag.className = "selected-tag";
      tag.innerHTML = `
                ${value}
                <span class="remove-tag" data-value="${value}">×</span>
            `;
      selectedItems.appendChild(tag);
    });

    // Добавляем обработчики для удаления тегов
    document.querySelectorAll(".remove-tag").forEach((removeBtn) => {
      removeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const value = this.getAttribute("data-value");
        const optionToDeselect = optionsContainer.querySelector(
          `.dropdown-option[data-value="${value}"]`
        );
        if (optionToDeselect) {
          optionToDeselect.classList.remove("selected");
          updateSelectedItems();
          // Обновляем состояние кнопки после удаления
          updateNextButtonState(2);
        }
      });
    });
  }
}

// Функция для отображения выбранных специальностей со счетчиками на 3-м шаге
function renderSpecialtiesWithCounters() {
  const specialtiesContainer = document.getElementById("specialtiesContainer");

  specialtiesContainer.innerHTML = "";

  if (quizData.specialties.length === 0) {
    specialtiesContainer.innerHTML =
      '<p class="no-specialties">Нет выбранных специальностей. Вернитесь на предыдущий шаг и выберите сотрудников.</p>';
    return;
  }

  let totalEmployees = 0;

  quizData.specialties.forEach((specialty) => {
    // Инициализируем счетчик для каждой специальности, если его еще нет
    if (!quizData.employeeCount[specialty]) {
      quizData.employeeCount[specialty] = 1;
    }

    totalEmployees += quizData.employeeCount[specialty];

    // Создаем элемент специальности со счетчиком и крестиком
    const specialtyItem = document.createElement("div");
    specialtyItem.className = "specialty-item";
    specialtyItem.innerHTML = `
            <div class="specialty-name">${specialty}</div>
            <div class="quantity-controls">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-specialty="${specialty}">
                        <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.75C0 0.335786 0.335786 0 0.75 0L11.25 6.55651e-07C11.6642 6.55651e-07 12 0.335787 12 0.75C12 1.16421 11.6642 1.5 11.25 1.5L0.75 1.5C0.335786 1.5 0 1.16421 0 0.75Z" fill="#B4B0AE"/>
                        </svg>
                    </button>
                    <input class="quantity-input" id="count-${specialty}" 
                        value="${quizData.employeeCount[specialty]}" min="1" max="100">
                    <button class="quantity-btn plus" data-specialty="${specialty}">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.75 0.75C6.75 0.335786 6.41421 0 6 0C5.58579 0 5.25 0.335786 5.25 0.75V5.25H0.75C0.335786 5.25 0 5.58579 0 6C0 6.41421 0.335786 6.75 0.75 6.75L5.25 6.75V11.25C5.25 11.6642 5.58579 12 6 12C6.41421 12 6.75 11.6642 6.75 11.25V6.75L11.25 6.75C11.6642 6.75 12 6.41421 12 6C12 5.58579 11.6642 5.25 11.25 5.25H6.75V0.75Z" fill="#B4B0AE"/>
                        </svg>
                    </button>
                </div>
                <button class="remove-specialty" data-specialty="${specialty}" title="Удалить">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.28033 0.21967C0.987437 -0.0732233 0.512563 -0.0732233 0.21967 0.21967C-0.0732233 0.512563 -0.0732233 0.987437 0.21967 1.28033L3.93934 5L0.21967 8.71967C-0.0732233 9.01256 -0.0732233 9.48744 0.21967 9.78033C0.512563 10.0732 0.987437 10.0732 1.28033 9.78033L5 6.06066L8.71967 9.78033C9.01256 10.0732 9.48744 10.0732 9.78033 9.78033C10.0732 9.48744 10.0732 9.01256 9.78033 8.71967L6.06066 5L9.78033 1.28033C10.0732 0.987437 10.0732 0.512563 9.78033 0.21967C9.48744 -0.0732233 9.01256 -0.0732233 8.71967 0.21967L5 3.93934L1.28033 0.21967Z" fill="#0F172A"/>
                    </svg>
                </button>
            </div>
        `;
    specialtiesContainer.appendChild(specialtyItem);

    // Обработчики для кнопок +/-
    const minusBtn = specialtyItem.querySelector(".minus");
    const plusBtn = specialtyItem.querySelector(".plus");
    const input = specialtyItem.querySelector(".quantity-input");
    const removeBtn = specialtyItem.querySelector(".remove-specialty");

    // Обновляем состояние кнопок при загрузке
    updateButtonState(minusBtn, input.value);

    minusBtn.addEventListener("click", function () {
      let value = parseInt(input.value);
      if (value > 1) {
        value--;
        input.value = value;
        quizData.employeeCount[specialty] = value;
        updateButtonState(minusBtn, value);
        updateTotalCount();
        updateNextButtonState(3);
      }
    });

    plusBtn.addEventListener("click", function () {
      let value = parseInt(input.value);
      if (value < 100) {
        value++;
        input.value = value;
        quizData.employeeCount[specialty] = value;
        updateButtonState(minusBtn, value);
        updateTotalCount();
        updateNextButtonState(3);
      }
    });

    input.addEventListener("change", function () {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) value = 1;
      if (value > 100) value = 100;
      this.value = value;
      quizData.employeeCount[specialty] = value;
      updateButtonState(minusBtn, value);
      updateTotalCount();
      updateNextButtonState(3);
    });

    input.addEventListener("input", function () {
      updateButtonState(minusBtn, this.value);
    });

    // Обработчик для кнопки удаления
    removeBtn.addEventListener("click", function () {
      // Удаляем специальность из данных
      const index = quizData.specialties.indexOf(specialty);
      if (index > -1) {
        quizData.specialties.splice(index, 1);
        delete quizData.employeeCount[specialty];
      }

      // Обновляем отображение
      renderSpecialtiesWithCounters();
      updateTotalCount();
      updateNextButtonState(3);

      // Обновляем выпадающий список (снимаем выделение)
      const dropdownOption = document.querySelector(
        `.dropdown-option[data-value="${specialty}"]`
      );
      if (dropdownOption) {
        dropdownOption.classList.remove("selected");
        updateSelectedItems();
      }
    });
  });

  updateNextButtonState(3);
}

// Функция для обновления состояния кнопки "-"
function updateButtonState(minusBtn, value) {
  if (parseInt(value) <= 1) {
    minusBtn.disabled = true;
  } else {
    minusBtn.disabled = false;
  }
}

// Функция для обновления общего количества сотрудников
function updateTotalCount() {
  const totalCountElement = document.getElementById("totalCount");
  if (totalCountElement) {
    let total = 0;
    for (const specialty in quizData.employeeCount) {
      total += quizData.employeeCount[specialty];
    }
    totalCountElement.innerHTML = `Общее количество сотрудников: <strong>${total}</strong>`;
  }
}

// Функция для перехода к следующему вопросу
function nextQuestion(currentQuestion) {
  // Валидация перед переходом
  if (!validateQuestion(currentQuestion)) {
    return;
  }

  // Сохранение данных текущего вопроса
  saveQuestionData(currentQuestion);

  // Особенная логика для перехода на 3-й вопрос
  if (currentQuestion === 2) {
    renderSpecialtiesWithCounters();
  }

  // Скрытие текущего вопроса
  const currentQuestionElement = document.getElementById(
    `question${currentQuestion}`
  );
  if (currentQuestionElement) {
    currentQuestionElement.classList.remove("active");
  }

  // Если это последний вопрос (4), показываем результат
  if (currentQuestion === 4) {
    // ВЫЗОВ showResult ТОЛЬКО ОДИН РАЗ
    if (
      !document.getElementById("result").style.display ||
      document.getElementById("result").style.display === "none"
    ) {
      showResult();
    }
    return;
  }

  // Показ следующего вопроса
  const nextQuestionElement = document.getElementById(
    `question${currentQuestion + 1}`
  );
  if (nextQuestionElement) {
    nextQuestionElement.classList.add("active");
  }

  // Обновление прогресс-бара
  updateProgressBar(currentQuestion);

  // Обновление состояния кнопки для следующего вопроса
  updateNextButtonState(currentQuestion + 1);
}

// Функция для возврата к предыдущему вопросу
function prevQuestion(currentQuestion) {
  // Скрытие текущего вопроса
  const currentQuestionElement = document.getElementById(
    `question${currentQuestion}`
  );
  if (currentQuestionElement) {
    currentQuestionElement.classList.remove("active");
  }

  // Показ предыдущего вопроса
  const prevQuestionElement = document.getElementById(
    `question${currentQuestion - 1}`
  );
  if (prevQuestionElement) {
    prevQuestionElement.classList.add("active");
  }

  // Обновление прогресс-бара
  updateProgressBar(currentQuestion - 2);

  // Обновление состояния кнопки для предыдущего вопроса
  updateNextButtonState(currentQuestion - 1);
}

// Функция для валидации вопроса перед переходом
function validateQuestion(questionNumber) {
  switch (questionNumber) {
    case 1:
      const employmentTypeSelected = document.querySelector(
        'input[name="employment_type"]:checked'
      );
      if (!employmentTypeSelected) {
        return false;
      }
      break;
    case 2:
      if (quizData.specialties.length === 0) {
        return false;
      }
      break;
    case 3:
      let totalCount = 0;
      for (const specialty in quizData.employeeCount) {
        totalCount += quizData.employeeCount[specialty];
      }
      if (totalCount === 0) {
        return false;
      }
      break;
    case 4:
      const durationSelected = document.querySelector(
        'input[name="duration"]:checked'
      );
      if (!durationSelected) {
        return false;
      }
      break;
  }
  return true;
}

// Функция для сохранения данных вопроса
function saveQuestionData(questionNumber) {
  switch (questionNumber) {
    case 1:
      const employmentTypeSelected = document.querySelector(
        'input[name="employment_type"]:checked'
      );
      quizData.employmentType = employmentTypeSelected.value;
      break;
    case 4:
      const durationSelected = document.querySelector(
        'input[name="duration"]:checked'
      );
      quizData.duration = durationSelected.value;
      break;
  }
  // УБРАН ВЫЗОВ logQuizData() - данные сохраняются, но не выводятся
}

// Функция для обновления прогресс-бара
function updateProgressBar(currentQuestion) {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  const progressPercentage = (currentQuestion / 3) * 100;
  progressFill.style.width = `${progressPercentage}%`;
  progressText.textContent = `Вопрос ${currentQuestion + 1} из 4-х`;
}

// Функция для применения маски к телефону
function applyPhoneMask(input) {
  input.addEventListener("input", function (e) {
    let x = e.target.value
      .replace(/\D/g, "")
      .match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);

    if (x[1] === "8" || x[1] === "7") {
      x[1] = "+7";
    } else if (x[1] === "") {
      x[1] = "+7";
    }

    e.target.value = !x[3]
      ? x[1] + x[2]
      : x[1] +
        " (" +
        x[2] +
        ") " +
        x[3] +
        (x[4] ? "-" + x[4] : "") +
        (x[5] ? "-" + x[5] : "");
  });
}

function showResult() {
  // Сохранение данных последнего вопроса
  saveQuestionData(4);

  // Валидация последнего вопроса
  if (!validateQuestion(4)) {
    return;
  }

  // Скрытие заголовка квиза
  const quizTitle = document.querySelector(".quiz-title");
  if (quizTitle) {
    quizTitle.style.display = "none";
  }

  // Скрытие прогресс-бара
  const progressContainer = document.querySelector(".progress-container");
  if (progressContainer) {
    progressContainer.style.display = "none";
  }

  const imgRight = document.querySelector(".img-right");
  if (imgRight) {
    imgRight.style.display = "none";
  }

  // Скрытие последнего вопроса
  document.getElementById("question4").classList.remove("active");

  // Показ результатов
  const resultElement = document.getElementById("result");
  resultElement.style.display = "flex";

  // Заполнение сводки
  document.getElementById("summaryType").textContent = quizData.employmentType;
  document.getElementById("summaryDuration").textContent = quizData.duration;

  // Отображаем сотрудников с количеством
  renderEmployeesSummary();

  // ВЫВОД ДАННЫХ ТОЛЬКО ЗДЕСЬ - ОДИН РАЗ В КОНЦЕ
  //   console.log("🎉 ФИНАЛЬНЫЕ ДАННЫЯ КВИЗА:");
  logQuizData();

  // Убираем required атрибуты чтобы избежать браузерной валидации
  const requiredInputs = document.querySelectorAll(
    "#contactForm input[required]"
  );
  requiredInputs.forEach((input) => {
    input.removeAttribute("required");
  });

  // Запрет букв в телефоне и скрытие ошибки при вводе
  const phoneInput = document.querySelector('input[type="tel"]');
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^\d+()-]/g, "");
    document.getElementById("phoneError").style.display = "none";
  });

  // Скрываем ошибку email при вводе
  const emailInput = document.querySelector('input[type="email"]');
  emailInput.addEventListener("input", function () {
    document.getElementById("emailError").style.display = "none";
  });

  // Скрываем ошибку чекбокса при изменении
  const checkbox = document.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", function () {
    document.getElementById("checkboxError").style.display = "none";
  });

  // Обработка отправки формы
  document
    .getElementById("contactForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const errorMessages = document.querySelectorAll(".error-message");
      errorMessages.forEach((error) => {
        error.style.display = "none";
      });

      let isValid = true;

      // Проверка email
      const emailInput = document.querySelector('input[type="email"]');
      const emailError = document.getElementById("emailError");
      if (!emailInput.value.trim()) {
        emailError.style.display = "flex";
        isValid = false;
      }

      // Проверка телефона
      const phoneInput = document.querySelector('input[type="tel"]');
      const phoneError = document.getElementById("phoneError");
      if (!phoneInput.value.trim()) {
        phoneError.style.display = "flex";
        isValid = false;
      }

      // Проверка чекбокса
      const checkbox = document.querySelector('input[type="checkbox"]');
      const checkboxError = document.getElementById("checkboxError");
      if (!checkbox.checked) {
        checkboxError.style.display = "block";
        isValid = false;
      }

      if (isValid) {
        const resultForm = document.querySelector(".result-form");
        resultForm.innerHTML = `
        <div class="thank-you-message">
          <h3>Спасибо за вашу заявку!</h3>
          <p>Мы свяжемся с вами в ближайшее время для уточнения деталей.</p>
        </div>
      `;
      }
    });
}

// Функция для отображения сотрудников со счетчиками в результатах
function renderEmployeesSummary() {
  const employeesSummary = document.getElementById("employeesSummary");
  employeesSummary.innerHTML = "";

  if (quizData.specialties.length === 0) {
    employeesSummary.innerHTML =
      '<span style="color: #7f8c8d;">Нет выбранных сотрудников</span>';
    return;
  }

  let totalEmployees = 0;

  quizData.specialties.forEach((specialty) => {
    const count = quizData.employeeCount[specialty] || 1;
    totalEmployees += count;

    const specialtyItem = document.createElement("div");
    specialtyItem.className = "specialty-item";
    specialtyItem.innerHTML = `
            <div class="specialty-name">${specialty}</div>
            <div class="quantity-controls">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-specialty="${specialty}">
                        <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.75C0 0.335786 0.335786 0 0.75 0L11.25 6.55651e-07C11.6642 6.55651e-07 12 0.335787 12 0.75C12 1.16421 11.6642 1.5 11.25 1.5L0.75 1.5C0.335786 1.5 0 1.16421 0 0.75Z" fill="#B4B0AE"/>
                        </svg>
                    </button>
                    <input class="quantity-input" id="summary-count-${specialty}" 
                        value="${count}" min="1" max="100">
                    <button class="quantity-btn plus" data-specialty="${specialty}">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.75 0.75C6.75 0.335786 6.41421 0 6 0C5.58579 0 5.25 0.335786 5.25 0.75V5.25H0.75C0.335786 5.25 0 5.58579 0 6C0 6.41421 0.335786 6.75 0.75 6.75L5.25 6.75V11.25C5.25 11.6642 5.58579 12 6 12C6.41421 12 6.75 11.6642 6.75 11.25V6.75L11.25 6.75C11.6642 6.75 12 6.41421 12 6C12 5.58579 11.6642 5.25 11.25 5.25H6.75V0.75Z" fill="#B4B0AE"/>
                        </svg>
                    </button>
                </div>
                <button class="remove-specialty" data-specialty="${specialty}" title="Удалить">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.28033 0.21967C0.987437 -0.0732233 0.512563 -0.0732233 0.21967 0.21967C-0.0732233 0.512563 -0.0732233 0.987437 0.21967 1.28033L3.93934 5L0.21967 8.71967C-0.0732233 9.01256 -0.0732233 9.48744 0.21967 9.78033C0.512563 10.0732 0.987437 10.0732 1.28033 9.78033L5 6.06066L8.71967 9.78033C9.01256 10.0732 9.48744 10.0732 9.78033 9.78033C10.0732 9.48744 10.0732 9.01256 9.78033 8.71967L6.06066 5L9.78033 1.28033C10.0732 0.987437 10.0732 0.512563 9.78033 0.21967C9.48744 -0.0732233 9.01256 -0.0732233 8.71967 0.21967L5 3.93934L1.28033 0.21967Z" fill="#0F172A"/>
                    </svg>
                </button>
            </div>
        `;
    employeesSummary.appendChild(specialtyItem);

    // Обработчики для кнопок +/-
    const minusBtn = specialtyItem.querySelector(".minus");
    const plusBtn = specialtyItem.querySelector(".plus");
    const input = specialtyItem.querySelector(".quantity-input");
    const removeBtn = specialtyItem.querySelector(".remove-specialty");

    updateButtonState(minusBtn, input.value);

    minusBtn.addEventListener("click", function () {
      let value = parseInt(input.value);
      if (value > 1) {
        value--;
        input.value = value;
        quizData.employeeCount[specialty] = value;
        updateButtonState(minusBtn, value);
      }
    });

    plusBtn.addEventListener("click", function () {
      let value = parseInt(input.value);
      if (value < 100) {
        value++;
        input.value = value;
        quizData.employeeCount[specialty] = value;
        updateButtonState(minusBtn, value);
      }
    });

    input.addEventListener("change", function () {
      let value = parseInt(this.value);
      if (isNaN(value) || value < 1) value = 1;
      if (value > 100) value = 100;
      this.value = value;
      quizData.employeeCount[specialty] = value;
      updateButtonState(minusBtn, value);
    });

    input.addEventListener("input", function () {
      updateButtonState(minusBtn, this.value);
    });

    // Обработчик для кнопки удаления в результатах
    removeBtn.addEventListener("click", function () {
      const index = quizData.specialties.indexOf(specialty);
      if (index > -1) {
        quizData.specialties.splice(index, 1);
        delete quizData.employeeCount[specialty];
      }
      renderEmployeesSummary();
    });
  });
}
