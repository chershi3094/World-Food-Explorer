const countryGrid = document.getElementById("countryGrid");
const mealSection = document.getElementById("mealSection");
const mealTitle = document.getElementById("mealTitle");
const mealGrid = document.getElementById("mealGrid");
const detailsSection = document.getElementById("detailsSection");
const mealDetails = document.getElementById("mealDetails");
const backToCountries = document.getElementById("backToCountries");
const backToMeals = document.getElementById("backToMeals");

const countries = [
  "American", "British", "Canadian", "Chinese", "Croatian", "Dutch", "Egyptian",
  "Filipino", "French", "Greek", "Indian", "Irish", "Italian", "Jamaican", "Japanese",
  "Kenyan", "Malaysian", "Mexican", "Moroccan", "Polish", "Portuguese", "Russian",
  "Spanish", "Thai", "Tunisian", "Turkish", "Vietnamese", "Korean", "Lebanese", "Brazilian"
];

function createCountryItem(country) {
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = `<img src="https://source.unsplash.com/300x200/?${country},food,culture" alt="${country}"><h4>${country}</h4>`;
  div.onclick = () => loadMeals(country);
  countryGrid.appendChild(div);
}

function getRandomMeals(count) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(res => res.json()));
  }
  return Promise.all(promises).then(results => results.map(d => d.meals[0]));
}

async function loadMeals(country) {
  document.getElementById("countrySection").classList.add("hidden");
  mealSection.classList.remove("hidden");
  detailsSection.classList.add("hidden");
  mealGrid.innerHTML = "";
  mealTitle.textContent = `${country} Meals`;

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${country}`);
  const data = await res.json();
  let meals = data.meals || [];

  if (meals.length < 100) {
    const extra = await getRandomMeals(100 - meals.length);
    meals = meals.concat(extra.map(m => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb })));
  }

  meals = meals.slice(0, 100);

  meals.forEach(meal => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}"><h4>${meal.strMeal}</h4>`;
    div.onclick = () => showMealDetails(meal.idMeal);
    mealGrid.appendChild(div);
  });
}

async function showMealDetails(mealId) {
  mealSection.classList.add("hidden");
  detailsSection.classList.remove("hidden");

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const meal = (await res.json()).meals[0];

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${meas} ${ing}`);
  }

  mealDetails.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
    <h3>Ingredients</h3><ul>${ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
    <h3>Instructions</h3><p>${meal.strInstructions}</p>
    ${meal.strYoutube ? `
      <h3>Video</h3>
      <iframe width="100%" height="315"
        src="https://www.youtube.com/embed/${meal.strYoutube.split("v=")[1]}"
        frameborder="0" allowfullscreen>
      </iframe>` : ""}
  `;
}

backToCountries.onclick = () => {
  document.getElementById("countrySection").classList.remove("hidden");
  mealSection.classList.add("hidden");
};

backToMeals.onclick = () => {
  mealSection.classList.remove("hidden");
  detailsSection.classList.add("hidden");
};

countries.forEach(createCountryItem);

// 🔍 Search functionality
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const items = countryGrid.querySelectorAll(".item");
  items.forEach(item => {
    const name = item.querySelector("h4").textContent.toLowerCase();
    item.style.display = name.includes(term) ? "block" : "none";
  });
});
