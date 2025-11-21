const display = document.getElementById('display');
const loaders = document.getElementById('loaders');
const container = document.getElementsByClassName('container')
const containerBerylMovie = document.getElementById('containerBerylMovie')

function enterOperator(operator) {
    display.value += operator;
}

function enterNumbers(number) {
    display.value += number;
}

function results() {
    if (display.value === '5+5') {
        loaders.style.display = "block";
        container[0].style.filter = "blur(8px)";           
        
        setTimeout(() => {
            container[0].style.filter = 'none';
            loaders.style.display = "none";
            container[0].style.display = 'none';
            containerBerylMovie.style.display = 'block';
            
            document.body.style.overflow = 'auto';
            document.body.classList.remove('calculator-active');
            
            // Initialize hamburger menu after calculator
            setTimeout(() => {
                initializeHamburgerMenu();
            }, 100);
            
        }, 1500)
    }
    else {
        try {
            display.value = eval(display.value)
        }
        catch (error) {
            display.value = "sing genah kon lak gawe";
        }
    }
}

function reset() {
    display.value = "";
}

//  BERYLMOVIE //
const API_KEY = "d3f167b7858ec9ffab9cd029b168dd90";

let page = 1;
let currentYearFilter = null;
let currentGenreFilter = null;
let currentCountryFilter = null;

const API_URL = () => {
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;
  
  if (currentYearFilter) {
    url += `&primary_release_year=${currentYearFilter}`;
  }
  
  if (currentGenreFilter) {
    url += `&with_genres=${currentGenreFilter}`;
  }
  
  if (currentCountryFilter) {
    url += `&with_original_language=${currentCountryFilter}`;
  }
  
  return url;
};

const API_IMAGE_URL = "https://image.tmdb.org/t/p/w1280";
const API_SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`

const searchForm = document.getElementById('searchForm');
const search = document.getElementById('search');
const moviesElement = document.getElementById('moviesElement');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const currentPage = document.getElementById('currentPage');
const home = document.getElementById('home');

const movieModal = document.getElementById('movieModal');
const closeModal = document.querySelector('.close');
const moviePlayer = document.getElementById('moviePlayer');
const modalMovieTitle = document.getElementById('modalMovieTitle');
const modalRating = document.getElementById('modalRating');
const modalPopularity = document.getElementById('modalPopularity');
const modalOverview = document.getElementById('modalOverview');
const modalReleaseDate = document.getElementById('modalReleaseDate');
const modalLanguage = document.getElementById('modalLanguage');

function updatePage() {
    getMovies(API_URL());
    currentPage.innerHTML = `${page}`;
}

function nextPage() {
    if (page >= 1) {
        page += 1;
        updatePage()
    }
}

function prevPage() {
    if (page > 1) {
        page -= 1;
        updatePage()
    }
    else {
        alert("udah mentok king erpin🫡");
    }
}

next.addEventListener("click", () => {
    nextPage();
})

prev.addEventListener("click", () => {
    prevPage();
})

async function getMovies(url) {
    const res = await fetch(url)
    const data = await res.json();
    showMovies(data.results);
}

function showMovies(movies) {
    moviesElement.innerHTML = "";
    movies.forEach(movie => {
        const { id, title, poster_path, overview, popularity, vote_average, release_date, original_language } = movie;
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie");
        movieCard.setAttribute('data-movie-id', id);
        
        const shortOverview = overview 
            ? (overview.length > 200 ? overview.substring(0, 200) + '...' : overview)
            : 'No description available';
            
        movieCard.innerHTML = `
    <img src="${API_IMAGE_URL + poster_path}" alt="${title}"/>
    <span class="rating">⭐${vote_average}</span>
    <div class="detail">
    <h3>${title}</h3>
    <br>
    <p>${shortOverview}</p>
    </div>
    <h4 class="popularity"> <i class="fas fa-eye"></i> ${popularity}  </h4>
    `;
        moviesElement.appendChild(movieCard);
        
        movieCard.addEventListener('click', () => {
            showMovieDetails(movie);
        });
    })
}

async function getMovieTrailer(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
        const data = await response.json();
        
        const trailers = data.results.filter(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (trailers.length > 0) {
            return trailers[0].key;
        }
        
        const teasers = data.results.filter(video => 
            video.type === 'Teaser' && video.site === 'YouTube'
        );
        
        if (teasers.length > 0) {
            return teasers[0].key;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching trailer:', error);
        return null;
    }
}

async function showMovieDetails(movie) {
    const { title, vote_average, popularity, overview, release_date, original_language, id } = movie;
    
    modalMovieTitle.textContent = title;
    modalRating.textContent = `⭐ ${vote_average}`;
    modalPopularity.textContent = `👁 ${popularity}`;
    modalOverview.textContent = overview || 'No description available';
    modalReleaseDate.textContent = release_date || 'Unknown';
    modalLanguage.textContent = original_language ? original_language.toUpperCase() : 'Unknown';
    
    moviePlayer.innerHTML = `
        <div class="video-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading trailer...</p>
        </div>
    `;
    
    await loadMovieTrailer(id);
    
    movieModal.style.display = 'block';
}

async function loadMovieTrailer(movieId) {
    const trailerKey = await getMovieTrailer(movieId);
    
    if (trailerKey) {
        moviePlayer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        moviePlayer.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-film"></i>
                <p>Trailer tidak tersedia untuk film ini</p>
                <button class="watch-elsewhere" onclick="searchTrailerOnYouTube('${modalMovieTitle.textContent}')">
                    <i class="fab fa-youtube"></i> Cari di YouTube
                </button>
            </div>
        `;
    }
}

function searchTrailerOnYouTube(movieTitle) {
    const searchQuery = encodeURIComponent(`${movieTitle} official trailer`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
}

closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
    const iframe = moviePlayer.querySelector('iframe');
    if (iframe) {
        iframe.src = iframe.src;
    }
});

window.addEventListener('click', (event) => {
    if (event.target === movieModal) {
        movieModal.style.display = 'none';
        const iframe = moviePlayer.querySelector('iframe');
        if (iframe) {
            iframe.src = iframe.src;
        }
    }
});

searchForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const searchQuery = search.value;
    if(searchQuery !== "") {
        currentYearFilter = null;
        currentGenreFilter = null;
        currentCountryFilter = null;
        resetDropdownText();
        getMovies(API_SEARCH_URL + searchQuery);
        search.value = "";
    }
})

function filterByYear(year) {
    page = 1;
    currentYearFilter = year;
    currentGenreFilter = null;
    currentCountryFilter = null;
    getMovies(API_URL());
    updatePage();
    
    updateDropdownText('Tahun', year);
}

function filterByGenre(genreId, genreName) {
    page = 1;
    currentGenreFilter = genreId;
    currentYearFilter = null;
    currentCountryFilter = null;
    getMovies(API_URL());
    updatePage();
    
    updateDropdownText('Genre', genreName);
}

function filterByCountry(countryCode, countryName) {
    page = 1;
    currentCountryFilter = countryCode;
    currentYearFilter = null;
    currentGenreFilter = null;
    getMovies(API_URL());
    updatePage();
    
    updateDropdownText('Negara', countryName);
}

function updateDropdownText(type, value) {
    const dropdowns = document.querySelectorAll('.dropbtn');
    dropdowns.forEach(btn => {
        if (btn.textContent.includes(type)) {
            btn.innerHTML = `${type} ${value} <span class="arrow">▼</span>`;
        }
    });
}

function resetDropdownText() {
    const dropdowns = document.querySelectorAll('.dropbtn');
    dropdowns.forEach(btn => {
        if (btn.textContent.includes('Tahun')) {
            btn.innerHTML = `Tahun <span class="arrow">▼</span>`;
        }
        if (btn.textContent.includes('Genre')) {
            btn.innerHTML = `Genre <span class="arrow">▼</span>`;
        }
        if (btn.textContent.includes('Negara')) {
            btn.innerHTML = `Negara <span class="arrow">▼</span>`;
        }
    });
}

function resetFilters() {
    page = 1;
    currentYearFilter = null;
    currentGenreFilter = null;
    currentCountryFilter = null;
    getMovies(API_URL());
    updatePage();
    resetDropdownText();
}

function setupEventListeners() {
    const yearLinks = document.querySelectorAll('.dropdown-content a[data-year]');
    yearLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const year = link.getAttribute('data-year');
            filterByYear(year);
        });
    });
    
    const genreLinks = document.querySelectorAll('.dropdown-content a[data-genre]');
    genreLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const genreId = link.getAttribute('data-genre');
            const genreName = link.textContent;
            filterByGenre(genreId, genreName);
        });
    });
    
    const countryLinks = document.querySelectorAll('.dropdown-content a[data-country]');
    countryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const countryCode = link.getAttribute('data-country');
            const countryName = link.textContent;
            filterByCountry(countryCode, countryName);
        });
    });
}

home.addEventListener('click', (e) => {
    e.preventDefault();
    resetFilters();
});

setupEventListeners();
updatePage();

document.getElementById('bestRating').addEventListener('click', openBestRatingModal);
document.getElementById('dmca').addEventListener('click', openDMCAModal);
document.getElementById('faq').addEventListener('click', openFAQModal);
document.getElementById('ads').addEventListener('click', openAdsModal);

function openBestRatingModal() {
    loadTopRatedMovies();
    document.getElementById('bestRatingModal').style.display = 'block';
}

function openDMCAModal() {
    document.getElementById('dmcaModal').style.display = 'block';
}

function openFAQModal() {
    document.getElementById('faqModal').style.display = 'block';
}

function openAdsModal() {
    document.getElementById('adsModal').style.display = 'block';
}

async function loadTopRatedMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        displayTopRatedMovies(data.results.slice(0, 5));
    } catch (error) {
        console.error('Error loading top rated movies:', error);
        document.getElementById('topMovies').innerHTML = '<p>Gagal memuat film rating tertinggi</p>';
    }
}

function displayTopRatedMovies(movies) {
    const topMoviesElement = document.getElementById('topMovies');
    topMoviesElement.innerHTML = '';
    
    movies.forEach(movie => {
        const { title, vote_average, poster_path, release_date } = movie;
        const movieItem = document.createElement('div');
        movieItem.classList.add('top-movie-item');
        movieItem.innerHTML = `
            <img src="${API_IMAGE_URL + poster_path}" alt="${title}">
            <div class="movie-details">
                <h4>${title}</h4>
                <p>📅 ${release_date ? release_date.substring(0, 4) : 'TBA'}</p>
            </div>
            <div class="rating-badge">⭐ ${vote_average.toFixed(1)}</div>
        `;
        topMoviesElement.appendChild(movieItem);
    });
}

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// ========== HAMBURGER MENU FIXED VERSION ==========
function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    
    if (!hamburger || !mobileNav) {
        console.log('Hamburger elements not found');
        return;
    }

    // Hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            closeAllMobileDropdowns();
        }
    });

    // Mobile menu item clicks
    setupMobileMenuClicks();
}


function setupMobileMenuClicks() {
    // Home
    const mobileHome = document.getElementById('mobileHome');
    if (mobileHome) {
        mobileHome.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            resetFilters();
        });
    }

    // Best Rating
    const mobileBestRating = document.getElementById('mobileBestRating');
    if (mobileBestRating) {
        mobileBestRating.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            openBestRatingModal();
        });
    }

    // DMCA
    const mobileDmca = document.getElementById('mobileDmca');
    if (mobileDmca) {
        mobileDmca.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            openDMCAModal();
        });
    }

    // FAQ
    const mobileFaq = document.getElementById('mobileFaq');
    if (mobileFaq) {
        mobileFaq.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            openFAQModal();
        });
    }

    // Ads
    const mobileAds = document.getElementById('mobileAds');
    if (mobileAds) {
        mobileAds.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            openAdsModal();
        });
    }
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburger && mobileNav) {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
    }
}

// Initialize hamburger menu when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeHamburgerMenu();
});

// Re-initialize on window resize
window.addEventListener('resize', function() {
    initializeHamburgerMenu();
});