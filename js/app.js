const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let offset = 0;
const limit = 6;
let totalPokemon = 0;

function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
}

async function fetchPokemonList(offset, limit) {
    showLoader(true);
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        if (!response.ok) throw new Error('Error en la solicitud');
        const data = await response.json();
        totalPokemon = data.count;
        return data.results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    } finally {
        showLoader(false);
    }
}

async function fetchPokemonDetails(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!response.ok) throw new Error('Error en la solicitud');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function fetchPokemonSpecies(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        if (!response.ok) throw new Error('Error en la solicitud');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function createCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('card');

    const pokemonId = pokemon.url.split('/')[6];
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = pokemon.name;

 
     const number = document.createElement('div');
     number.classList.add('number');
     number.textContent = `${pokemonId.padStart(1, '0')}`;

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const type = document.createElement('div');
    type.classList.add('type');
    type.textContent = await getType(pokemonId);

    const classification = document.createElement('div');
    classification.classList.add('classification');
    classification.textContent = await getClassification(pokemonId);

    const stats = document.createElement('div');
    stats.classList.add('stats');
    stats.innerHTML = await getStats(pokemonId);

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(classification);
    card.appendChild(type);
    card.appendChild(stats);
    card.appendChild(number);

    return card;
}

async function getType(pokemonId) {
    try {
        const data = await fetchPokemonDetails(pokemonId);
        if (data) {
            return data.types.map(type => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)).join(', ');
        }
        return 'Tipo no disponible';
    } catch (error) {
        console.error('Error:', error);
        return 'Tipo no disponible';
    }
}

async function getClassification(pokemonId) {
    try {
        const species = await fetchPokemonSpecies(pokemonId);
        if (species) {
            return species.genera.find(genus => genus.language.name === 'en')?.genus || 'Categoría no disponible';
        }
        return 'Categoría no disponible';
    } catch (error) {
        console.error('Error:', error);
        return 'Categoría no disponible';
    }
}

async function getStats(pokemonId) {
    try {
        const data = await fetchPokemonDetails(pokemonId);
        if (data) {
            const hp = data.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 'Desconocido';
            const cp = data.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 'Desconocido';
            const height = data.height / 10; 
            const weight = data.weight / 10; 

            return `
                <div class="stat-item">HP: ${hp}</div>
                <div class="stat-item">CP: ${cp}</div>
                <div class="stat-item">H: ${height.toFixed(2)} m</div>
                <div class="stat-item">W: ${weight.toFixed(2)} kg</div>
            `;
        }
        return 'Estadísticas no disponibles';
    } catch (error) {
        console.error('Error:', error);
        return 'Estadísticas no disponibles';
    }
}

async function loadPokemon() {
    const pokemonList = await fetchPokemonList(offset, limit);
    gallery.innerHTML = '';
    for (const pokemon of pokemonList) {
        const card = await createCard(pokemon);
        gallery.appendChild(card);
    }
    updateButtons();
}

prevBtn.addEventListener('click', () => {
    if (offset >= limit) {
        offset -= limit;
        loadPokemon();
    }
});

nextBtn.addEventListener('click', () => {
    offset += limit;
    loadPokemon();
});


function updateButtons() {
    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset + limit >= totalPokemon; 
}
// Load initial Pokémon
loadPokemon();
