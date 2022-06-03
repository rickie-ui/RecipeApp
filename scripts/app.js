const mealsEl = document.getElementById('meals');
const favContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoEl = document.getElementById('meal-info');

getRandomMeals();
fetchFavMeals();

async function getRandomMeals() {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/random.php'
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}
async function getMealById(id) {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    'https://www.themealdb.com/api/json/v1/1/search.php?s=' + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  //clean the container
  favContainer.innerHTML = '';

  const meal = document.createElement('div');
  meal.classList.add('meal');
  meal.innerHTML = `
          <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ''}
            <span class="body-info"><i class="fa fa-info-circle">Info</i></span>
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
         <button class="fav-btn active">
            <i class="fa fa-heart"></i>
         </button>
          </div>
    `;
  const btn = meal.querySelector('.meal-body .fav-btn');
  btn.addEventListener('click', () => {
    if (btn.classList.contains('active')) {
      removeMealFromLs(mealData.idMeal);
      btn.classList.remove('active');
    } else {
      addMealToLs(mealData.idMeal);
      btn.classList.add('active');
    }

    fetchFavMeals();
  });

  const infoBtn = meal.querySelector('.body-info');
  infoBtn.addEventListener('click', () => {
    showMealInfo(mealData);
  });
  mealsEl.appendChild(meal);
}

function addMealToLs(mealId) {
  const mealIds = getMealFromLs();
  localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLs(mealId) {
  const mealIds = getMealFromLs();
  localStorage.setItem(
    'mealIds',
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealFromLs() {
  const mealIds = JSON.parse(localStorage.getItem('mealIds'));
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  const mealIds = getMealFromLs();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);

    addMealToFav(meal);
  }
}

function addMealToFav(mealData) {
  const favMeal = document.createElement('li');

  favMeal.innerHTML = `
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            /><span>${mealData.strMeal}</span>
            <span class="info"><i class="fa fa-info-circle">Info</i></span>
            <button class="clear">Remove</button>
    `;

  const btn = favMeal.querySelector('.clear');
  btn.addEventListener('click', () => {
    removeMealFromLs(mealData.idMeal);

    fetchFavMeals();
  });
  const btnInfo = favMeal.querySelector('.info');
  btnInfo.addEventListener('click', () => {
    showMealInfo(mealData);
  });

  favContainer.appendChild(favMeal);
}
function showMealInfo(mealData) {
  //clean the container
  mealInfoEl.innerHTML = '';
  //update the meal info
  const mealEl = document.createElement('div');

  //get ingredients and measures
  const ingredients = [];
  for (let i = 0; i < 200; i++) {
    if (mealData['strIngredient' + i]) {
      ingredients.push(
        ` ${mealData['strIngredient' + i]} -
            ${mealData['strMeasure' + i]}
        `
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
   <h2>${mealData.strMeal}</h2>
          <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
          />

          <p>
          ${mealData.strInstructions}
          </p>

          <h3>Ingredients:</h3>
          <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join('')}
          </ul>
  `;
  mealInfoEl.appendChild(mealEl);
  // show the popup
  mealPopup.classList.remove('hidden');
}
searchBtn.addEventListener('click', async () => {
  //clean container
  mealsEl.innerHTML = '';
  const search = searchTerm.value;
  const meals = await getMealsBySearch(search);
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  } else {
    const div = document.getElementById('meals');
    div.insertAdjacentHTML(
      'afterbegin',
      `<div class="alert">
    <strong>Oops!</strong> Meal not found!
  </div>`
    );
  }
});

popupCloseBtn.addEventListener('click', () => {
  mealPopup.classList.add('hidden');
});
