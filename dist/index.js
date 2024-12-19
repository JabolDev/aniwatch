var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/hianime/hianime.ts
var hianime_exports = {};
__export(hianime_exports, {
  Scraper: () => Scraper,
  Servers: () => Servers
});

// src/hianime/scrapers/homePage.ts
import { load } from "cheerio";

// src/config/client.ts
import axios, { AxiosError } from "axios";

// src/utils/constants.ts
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var ACCEPT_ENCODING_HEADER = "gzip, deflate, br";
var USER_AGENT_HEADER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4692.71 Safari/537.36";
var ACCEPT_HEADER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9";
var DOMAIN = "hianime.to";
var SRC_BASE_URL = `https://${DOMAIN}`;
var SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;
var SRC_HOME_URL = `${SRC_BASE_URL}/home`;
var SRC_SEARCH_URL = `${SRC_BASE_URL}/search`;
var genresIdMap = {
  action: 1,
  adventure: 2,
  cars: 3,
  comedy: 4,
  dementia: 5,
  demons: 6,
  drama: 8,
  ecchi: 9,
  fantasy: 10,
  game: 11,
  harem: 35,
  historical: 13,
  horror: 14,
  isekai: 44,
  josei: 43,
  kids: 15,
  magic: 16,
  "martial-arts": 17,
  mecha: 18,
  military: 38,
  music: 19,
  mystery: 7,
  parody: 20,
  police: 39,
  psychological: 40,
  romance: 22,
  samurai: 21,
  school: 23,
  "sci-fi": 24,
  seinen: 42,
  shoujo: 25,
  "shoujo-ai": 26,
  shounen: 27,
  "shounen-ai": 28,
  "slice-of-life": 36,
  space: 29,
  sports: 30,
  "super-power": 31,
  supernatural: 37,
  thriller: 41,
  vampire: 32
};
var typeIdMap = {
  all: 0,
  movie: 1,
  tv: 2,
  ova: 3,
  ona: 4,
  special: 5,
  music: 6
};
var statusIdMap = {
  all: 0,
  "finished-airing": 1,
  "currently-airing": 2,
  "not-yet-aired": 3
};
var ratedIdMap = {
  all: 0,
  g: 1,
  pg: 2,
  "pg-13": 3,
  r: 4,
  "r+": 5,
  rx: 6
};
var scoreIdMap = {
  all: 0,
  appalling: 1,
  horrible: 2,
  "very-bad": 3,
  bad: 4,
  average: 5,
  fine: 6,
  good: 7,
  "very-good": 8,
  great: 9,
  masterpiece: 10
};
var seasonIdMap = {
  all: 0,
  spring: 1,
  summer: 2,
  fall: 3,
  winter: 4
};
var languageIdMap = {
  all: 0,
  sub: 1,
  dub: 2,
  "sub-&-dub": 3
};
var sortIdMap = {
  default: "default",
  "recently-added": "recently_added",
  "recently-updated": "recently_updated",
  score: "score",
  "name-a-z": "name_az",
  "released-date": "released_date",
  "most-watched": "most_watched"
};

// src/config/client.ts
var clientConfig = {
  timeout: 8e3,
  // baseURL: SRC_BASE_URL,
  headers: {
    Accept: ACCEPT_HEADER,
    "User-Agent": USER_AGENT_HEADER,
    "Accept-Encoding": ACCEPT_ENCODING_HEADER
  }
};
var client = axios.create(clientConfig);

// src/hianime/error.ts
import { AxiosError as AxiosError2 } from "axios";
var ANSI_RED_COLOR = "\x1B[31m";
var ANSI_RESET_COLOR = "\x1B[0m";
var DEFAULT_ERROR_STATUS = 500;
var DEFAULT_ERROR_MESSAGE = "Something went wrong";
var HiAnimeError = class _HiAnimeError extends Error {
  scraper = DEFAULT_ERROR_MESSAGE;
  status = DEFAULT_ERROR_STATUS;
  constructor(errMsg, scraperName, status) {
    super(`${scraperName}: ${errMsg}`);
    this.name = _HiAnimeError.name;
    this.scraper = scraperName;
    if (status) {
      this.status = status >= 400 && status < 600 ? status : DEFAULT_ERROR_STATUS;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _HiAnimeError);
    }
    this.logError();
  }
  static wrapError(err, scraperName) {
    if (err instanceof _HiAnimeError) {
      return err;
    }
    if (err instanceof AxiosError2) {
      const statusText = err?.response?.statusText || DEFAULT_ERROR_MESSAGE;
      return new _HiAnimeError(
        "fetchError: " + statusText,
        scraperName,
        err.status || DEFAULT_ERROR_STATUS
      );
    }
    return new _HiAnimeError(err?.message || DEFAULT_ERROR_MESSAGE, scraperName);
  }
  json() {
    return {
      status: this.status,
      message: this.message
    };
  }
  logError() {
    console.error(
      ANSI_RED_COLOR + JSON.stringify(
        {
          status: this.status,
          scraper: this.scraper,
          message: this.message
        },
        null,
        2
      ) + ANSI_RESET_COLOR
    );
  }
};

// src/utils/methods.ts
var extractAnimes = ($, selector, scraperName) => {
  try {
    const animes = [];
    $(selector).each((_, el) => {
      const animeId = $(el).find(".film-detail .film-name .dynamic-name")?.attr("href")?.slice(1).split("?ref=search")[0] || null;
      animes.push({
        id: animeId,
        name: $(el).find(".film-detail .film-name .dynamic-name")?.text()?.trim(),
        jname: $(el).find(".film-detail .film-name .dynamic-name")?.attr("data-jname")?.trim() || null,
        poster: $(el).find(".film-poster .film-poster-img")?.attr("data-src")?.trim() || null,
        duration: $(el).find(".film-detail .fd-infor .fdi-item.fdi-duration")?.text()?.trim(),
        type: $(el).find(".film-detail .fd-infor .fdi-item:nth-of-type(1)")?.text()?.trim(),
        rating: $(el).find(".film-poster .tick-rate")?.text()?.trim() || null,
        episodes: {
          sub: Number(
            $(el).find(".film-poster .tick-sub")?.text()?.trim().split(" ").pop()
          ) || null,
          dub: Number(
            $(el).find(".film-poster .tick-dub")?.text()?.trim().split(" ").pop()
          ) || null
        }
      });
    });
    return animes;
  } catch (err) {
    throw HiAnimeError.wrapError(err, scraperName);
  }
};
var extractTop10Animes = ($, period, scraperName) => {
  try {
    const animes = [];
    const selector = `#top-viewed-${period} ul li`;
    $(selector).each((_, el) => {
      animes.push({
        id: $(el).find(".film-detail .dynamic-name")?.attr("href")?.slice(1).trim() || null,
        rank: Number($(el).find(".film-number span")?.text()?.trim()) || null,
        name: $(el).find(".film-detail .dynamic-name")?.text()?.trim() || null,
        jname: $(el).find(".film-detail .dynamic-name")?.attr("data-jname")?.trim() || null,
        poster: $(el).find(".film-poster .film-poster-img")?.attr("data-src")?.trim() || null,
        episodes: {
          sub: Number(
            $(el).find(".film-detail .fd-infor .tick-item.tick-sub")?.text()?.trim()
          ) || null,
          dub: Number(
            $(el).find(".film-detail .fd-infor .tick-item.tick-dub")?.text()?.trim()
          ) || null
        }
      });
    });
    return animes;
  } catch (err) {
    throw HiAnimeError.wrapError(err, scraperName);
  }
};
var extractMostPopularAnimes = ($, selector, scraperName) => {
  try {
    const animes = [];
    $(selector).each((_, el) => {
      animes.push({
        id: $(el).find(".film-detail .dynamic-name")?.attr("href")?.slice(1).trim() || null,
        name: $(el).find(".film-detail .dynamic-name")?.text()?.trim() || null,
        jname: $(el).find(".film-detail .film-name .dynamic-name").attr("data-jname")?.trim() || null,
        poster: $(el).find(".film-poster .film-poster-img")?.attr("data-src")?.trim() || null,
        episodes: {
          sub: Number($(el)?.find(".fd-infor .tick .tick-sub")?.text()?.trim()) || null,
          dub: Number($(el)?.find(".fd-infor .tick .tick-dub")?.text()?.trim()) || null
        },
        type: $(el)?.find(".fd-infor .tick")?.text()?.trim()?.replace(/[\s\n]+/g, " ")?.split(" ")?.pop() || null
      });
    });
    return animes;
  } catch (err) {
    throw HiAnimeError.wrapError(err, scraperName);
  }
};
function retrieveServerId($, index2, category) {
  return $(`.ps_-block.ps_-block-sub.servers-${category} > .ps__-list .server-item`)?.map(
    (_, el) => $(el).attr("data-server-id") == `${index2}` ? $(el) : null
  )?.get()[0]?.attr("data-id") || null;
}
function getGenresFilterVal(genreNames) {
  if (genreNames.length < 1) {
    return void 0;
  }
  return genreNames.map((name) => genresIdMap[name]).join(",");
}
function getSearchFilterValue(key, rawValue) {
  rawValue = rawValue.trim();
  if (!rawValue) return void 0;
  switch (key) {
    case "genres": {
      return getGenresFilterVal(rawValue.split(","));
    }
    case "type": {
      const val = typeIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "status": {
      const val = statusIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "rated": {
      const val = ratedIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "score": {
      const val = scoreIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "season": {
      const val = seasonIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "language": {
      const val = languageIdMap[rawValue] ?? 0;
      return val === 0 ? void 0 : `${val}`;
    }
    case "sort": {
      return sortIdMap[rawValue] ?? void 0;
    }
    default:
      return void 0;
  }
}
function getSearchDateFilterValue(isStartDate, rawValue) {
  rawValue = rawValue.trim();
  if (!rawValue) return void 0;
  const dateRegex = /^\d{4}-([0-9]|1[0-2])-([0-9]|[12][0-9]|3[01])$/;
  const dateCategory = isStartDate ? "s" : "e";
  const [year, month, date] = rawValue.split("-");
  if (!dateRegex.test(rawValue)) {
    return void 0;
  }
  return [
    Number(year) > 0 ? `${dateCategory}y=${year}` : "",
    Number(month) > 0 ? `${dateCategory}m=${month}` : "",
    Number(date) > 0 ? `${dateCategory}d=${date}` : ""
  ].filter((d) => Boolean(d));
}
function substringAfter(str, toFind) {
  const index2 = str.indexOf(toFind);
  return index2 == -1 ? "" : str.substring(index2 + toFind.length);
}
function substringBefore(str, toFind) {
  const index2 = str.indexOf(toFind);
  return index2 == -1 ? "" : str.substring(0, index2);
}

// src/hianime/scrapers/homePage.ts
async function getHomePage() {
  const res = {
    spotlightAnimes: [],
    trendingAnimes: [],
    latestEpisodeAnimes: [],
    topUpcomingAnimes: [],
    top10Animes: {
      today: [],
      week: [],
      month: []
    },
    topAiringAnimes: [],
    mostPopularAnimes: [],
    mostFavoriteAnimes: [],
    latestCompletedAnimes: [],
    genres: []
  };
  try {
    const mainPage = await client.get(SRC_HOME_URL);
    const $ = load(mainPage.data);
    const spotlightSelector = "#slider .swiper-wrapper .swiper-slide";
    $(spotlightSelector).each((_, el) => {
      const otherInfo = $(el).find(".deslide-item-content .sc-detail .scd-item").map((_2, el2) => $(el2).text().trim()).get().slice(0, -1);
      res.spotlightAnimes.push({
        rank: Number(
          $(el).find(".deslide-item-content .desi-sub-text")?.text().trim().split(" ")[0].slice(1)
        ) || null,
        id: $(el).find(".deslide-item-content .desi-buttons a")?.last()?.attr("href")?.slice(1)?.trim() || null,
        name: $(el).find(".deslide-item-content .desi-head-title.dynamic-name")?.text().trim(),
        description: $(el).find(".deslide-item-content .desi-description")?.text()?.split("[")?.shift()?.trim() || null,
        poster: $(el).find(".deslide-cover .deslide-cover-img .film-poster-img")?.attr("data-src")?.trim() || null,
        jname: $(el).find(".deslide-item-content .desi-head-title.dynamic-name")?.attr("data-jname")?.trim() || null,
        episodes: {
          sub: Number(
            $(el).find(
              ".deslide-item-content .sc-detail .scd-item .tick-item.tick-sub"
            )?.text()?.trim()
          ) || null,
          dub: Number(
            $(el).find(
              ".deslide-item-content .sc-detail .scd-item .tick-item.tick-dub"
            )?.text()?.trim()
          ) || null
        },
        type: otherInfo?.[0] || null,
        otherInfo
      });
    });
    const trendingSelector = "#trending-home .swiper-wrapper .swiper-slide";
    $(trendingSelector).each((_, el) => {
      res.trendingAnimes.push({
        rank: parseInt(
          $(el).find(".item .number")?.children()?.first()?.text()?.trim()
        ),
        id: $(el).find(".item .film-poster")?.attr("href")?.slice(1)?.trim() || null,
        name: $(el).find(".item .number .film-title.dynamic-name")?.text()?.trim(),
        jname: $(el).find(".item .number .film-title.dynamic-name")?.attr("data-jname")?.trim() || null,
        poster: $(el).find(".item .film-poster .film-poster-img")?.attr("data-src")?.trim() || null
      });
    });
    const latestEpisodeSelector = "#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item";
    res.latestEpisodeAnimes = extractAnimes(
      $,
      latestEpisodeSelector,
      getHomePage.name
    );
    const topUpcomingSelector = "#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item";
    res.topUpcomingAnimes = extractAnimes(
      $,
      topUpcomingSelector,
      getHomePage.name
    );
    const genreSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
    $(genreSelector).each((_, el) => {
      res.genres.push(`${$(el).text().trim()}`);
    });
    const mostViewedSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
    $(mostViewedSelector).each((_, el) => {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim();
      if (period === "day") {
        res.top10Animes.today = extractTop10Animes($, period, getHomePage.name);
        return;
      }
      if (period === "week") {
        res.top10Animes.week = extractTop10Animes($, period, getHomePage.name);
        return;
      }
      if (period === "month") {
        res.top10Animes.month = extractTop10Animes($, period, getHomePage.name);
      }
    });
    res.topAiringAnimes = extractMostPopularAnimes(
      $,
      "#anime-featured .row div:nth-of-type(1) .anif-block-ul ul li",
      getHomePage.name
    );
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      "#anime-featured .row div:nth-of-type(2) .anif-block-ul ul li",
      getHomePage.name
    );
    res.mostFavoriteAnimes = extractMostPopularAnimes(
      $,
      "#anime-featured .row div:nth-of-type(3) .anif-block-ul ul li",
      getHomePage.name
    );
    res.latestCompletedAnimes = extractMostPopularAnimes(
      $,
      "#anime-featured .row div:nth-of-type(4) .anif-block-ul ul li",
      getHomePage.name
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getHomePage.name);
  }
}

// src/hianime/scrapers/animeGenre.ts
import { load as load2 } from "cheerio";
async function getGenreAnime(genreName, page) {
  const res = {
    genreName,
    animes: [],
    genres: [],
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page)
  };
  genreName = genreName === "martial-arts" ? "marial-arts" : genreName;
  try {
    if (genreName.trim() === "") {
      throw new HiAnimeError("invalid genre name", getGenreAnime.name, 400);
    }
    page = page < 1 ? 1 : page;
    const genreUrl = new URL(
      `/genre/${genreName}?page=${page}`,
      SRC_BASE_URL
    );
    const mainPage = await client.get(genreUrl.href);
    const $ = load2(mainPage.data);
    const selector = "#main-content .tab-content .film_list-wrap .flw-item";
    const genreNameSelector = "#main-content .block_area .block_area-header .cat-heading";
    res.genreName = $(genreNameSelector)?.text()?.trim() ?? genreName;
    res.hasNextPage = $(".pagination > li").length > 0 ? $(".pagination li.active").length > 0 ? $(".pagination > li").last().hasClass("active") ? false : true : false : false;
    res.totalPages = Number(
      $('.pagination > .page-item a[title="Last"]')?.attr("href")?.split("=").pop() ?? $('.pagination > .page-item a[title="Next"]')?.attr("href")?.split("=").pop() ?? $(".pagination > .page-item.active a")?.text()?.trim()
    ) || 1;
    res.animes = extractAnimes($, selector, getGenreAnime.name);
    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }
    const genreSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
    $(genreSelector).each((_, el) => {
      res.genres.push(`${$(el).text().trim()}`);
    });
    const topAiringSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li";
    res.topAiringAnimes = extractMostPopularAnimes(
      $,
      topAiringSelector,
      getGenreAnime.name
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getGenreAnime.name);
  }
}

// src/hianime/scrapers/animeSearch.ts
import { load as load3 } from "cheerio";
var searchFilters = {
  filter: true,
  type: true,
  status: true,
  rated: true,
  score: true,
  season: true,
  language: true,
  start_date: true,
  end_date: true,
  sort: true,
  genres: true
};
async function _getAnimeSearchResults(q, page = 1, filters) {
  try {
    const res = {
      animes: [],
      mostPopularAnimes: [],
      searchQuery: q,
      searchFilters: filters,
      totalPages: 1,
      hasNextPage: false,
      currentPage: (Number(page) || 0) < 1 ? 1 : Number(page)
    };
    const url = new URL(SRC_SEARCH_URL);
    url.searchParams.set("keyword", q);
    url.searchParams.set("page", `${page}`);
    url.searchParams.set("sort", "default");
    for (const key in filters) {
      if (key.includes("_date")) {
        const dates = getSearchDateFilterValue(
          key === "start_date",
          filters[key] || ""
        );
        if (!dates) continue;
        dates.map((dateParam) => {
          const [key2, val] = dateParam.split("=");
          url.searchParams.set(key2, val);
        });
        continue;
      }
      const filterVal = getSearchFilterValue(
        key,
        filters[key] || ""
      );
      filterVal && url.searchParams.set(key, filterVal);
    }
    const mainPage = await client.get(url.href);
    const $ = load3(mainPage.data);
    const selector = "#main-content .tab-content .film_list-wrap .flw-item";
    res.hasNextPage = $(".pagination > li").length > 0 ? $(".pagination li.active").length > 0 ? $(".pagination > li").last().hasClass("active") ? false : true : false : false;
    res.totalPages = Number(
      $('.pagination > .page-item a[title="Last"]')?.attr("href")?.split("=").pop() ?? $('.pagination > .page-item a[title="Next"]')?.attr("href")?.split("=").pop() ?? $(".pagination > .page-item.active a")?.text()?.trim()
    ) || 1;
    res.animes = extractAnimes($, selector, getAnimeSearchResults.name);
    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }
    const mostPopularSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li";
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      mostPopularSelector,
      getAnimeSearchResults.name
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeSearchResults.name);
  }
}
async function getAnimeSearchResults(q, page, filters) {
  try {
    q = q.trim() ? decodeURIComponent(q.trim()) : "";
    if (q.trim() === "") {
      throw new HiAnimeError(
        "invalid search query",
        getAnimeSearchResults.name,
        400
      );
    }
    page = page < 1 ? 1 : page;
    const parsedFilters = {};
    for (const key in filters) {
      if (searchFilters[key]) {
        parsedFilters[key] = filters[key];
      }
    }
    return _getAnimeSearchResults(q, page, parsedFilters);
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeSearchResults.name);
  }
}

// src/hianime/scrapers/animeEpisodes.ts
import { load as load4 } from "cheerio";
async function getAnimeEpisodes(animeId) {
  const res = {
    totalEpisodes: 0,
    episodes: []
  };
  try {
    if (animeId.trim() === "" || animeId.indexOf("-") === -1) {
      throw new HiAnimeError("invalid anime id", getAnimeEpisodes.name, 400);
    }
    const episodesAjax = await client.get(
      `${SRC_AJAX_URL}/v2/episode/list/${animeId.split("-").pop()}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${SRC_BASE_URL}/watch/${animeId}`
        }
      }
    );
    const $ = load4(episodesAjax.data.html);
    res.totalEpisodes = Number($(".detail-infor-content .ss-list a").length);
    $(".detail-infor-content .ss-list a").each((_, el) => {
      res.episodes.push({
        title: $(el)?.attr("title")?.trim() || null,
        episodeId: $(el)?.attr("href")?.split("/")?.pop() || null,
        number: Number($(el).attr("data-number")),
        isFiller: $(el).hasClass("ssl-item-filler")
      });
    });
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeEpisodes.name);
  }
}

// src/hianime/scrapers/animeCategory.ts
import { load as load5 } from "cheerio";
async function getAnimeCategory(category, page) {
  const res = {
    animes: [],
    genres: [],
    top10Animes: {
      today: [],
      week: [],
      month: []
    },
    category,
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page)
  };
  try {
    if (category.trim() === "") {
      throw new HiAnimeError(
        "invalid anime category",
        getAnimeCategory.name,
        400
      );
    }
    page = page < 1 ? 1 : page;
    const scrapeUrl = new URL(category, SRC_BASE_URL);
    const mainPage = await client.get(`${scrapeUrl}?page=${page}`);
    const $ = load5(mainPage.data);
    const selector = "#main-content .tab-content .film_list-wrap .flw-item";
    const categoryNameSelector = "#main-content .block_area .block_area-header .cat-heading";
    res.category = $(categoryNameSelector)?.text()?.trim() ?? category;
    res.hasNextPage = $(".pagination > li").length > 0 ? $(".pagination li.active").length > 0 ? $(".pagination > li").last().hasClass("active") ? false : true : false : false;
    res.totalPages = Number(
      $('.pagination > .page-item a[title="Last"]')?.attr("href")?.split("=").pop() ?? $('.pagination > .page-item a[title="Next"]')?.attr("href")?.split("=").pop() ?? $(".pagination > .page-item.active a")?.text()?.trim()
    ) || 1;
    res.animes = extractAnimes($, selector, getAnimeCategory.name);
    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }
    const genreSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li";
    $(genreSelector).each((_, el) => {
      res.genres.push(`${$(el).text().trim()}`);
    });
    const top10AnimeSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
    $(top10AnimeSelector).each((_, el) => {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim();
      if (period === "day") {
        res.top10Animes.today = extractTop10Animes(
          $,
          period,
          getAnimeCategory.name
        );
        return;
      }
      if (period === "week") {
        res.top10Animes.week = extractTop10Animes(
          $,
          period,
          getAnimeCategory.name
        );
        return;
      }
      if (period === "month") {
        res.top10Animes.month = extractTop10Animes(
          $,
          period,
          getAnimeCategory.name
        );
      }
    });
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeCategory.name);
  }
}

// src/hianime/scrapers/animeProducer.ts
import { load as load6 } from "cheerio";
async function getProducerAnimes(producerName, page) {
  const res = {
    producerName,
    animes: [],
    top10Animes: {
      today: [],
      week: [],
      month: []
    },
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page)
  };
  try {
    if (producerName.trim() === "") {
      throw new HiAnimeError(
        "invalid producer name",
        getProducerAnimes.name,
        400
      );
    }
    page = page < 1 ? 1 : page;
    const producerUrl = new URL(
      `/producer/${producerName}?page=${page}`,
      SRC_BASE_URL
    );
    const mainPage = await client.get(producerUrl.href);
    const $ = load6(mainPage.data);
    const animeSelector = "#main-content .tab-content .film_list-wrap .flw-item";
    res.hasNextPage = $(".pagination > li").length > 0 ? $(".pagination li.active").length > 0 ? $(".pagination > li").last().hasClass("active") ? false : true : false : false;
    res.totalPages = Number(
      $('.pagination > .page-item a[title="Last"]')?.attr("href")?.split("=").pop() ?? $('.pagination > .page-item a[title="Next"]')?.attr("href")?.split("=").pop() ?? $(".pagination > .page-item.active a")?.text()?.trim()
    ) || 1;
    res.animes = extractAnimes($, animeSelector, getProducerAnimes.name);
    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }
    const producerNameSelector = "#main-content .block_area .block_area-header .cat-heading";
    res.producerName = $(producerNameSelector)?.text()?.trim() ?? producerName;
    const top10AnimeSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
    $(top10AnimeSelector).each((_, el) => {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim();
      if (period === "day") {
        res.top10Animes.today = extractTop10Animes(
          $,
          period,
          getProducerAnimes.name
        );
        return;
      }
      if (period === "week") {
        res.top10Animes.week = extractTop10Animes(
          $,
          period,
          getProducerAnimes.name
        );
        return;
      }
      if (period === "month") {
        res.top10Animes.month = extractTop10Animes(
          $,
          period,
          getProducerAnimes.name
        );
      }
    });
    const topAiringSelector = "#main-sidebar .block_area_sidebar:nth-child(2) .block_area-content .anif-block-ul ul li";
    res.topAiringAnimes = extractMostPopularAnimes(
      $,
      topAiringSelector,
      getProducerAnimes.name
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getProducerAnimes.name);
  }
}

// src/hianime/scrapers/episodeServers.ts
import { load as load7 } from "cheerio";
async function getEpisodeServers(episodeId) {
  const res = {
    sub: [],
    dub: [],
    raw: [],
    episodeId,
    episodeNo: 0
  };
  try {
    if (episodeId.trim() === "" || episodeId.indexOf("?ep=") === -1) {
      throw new HiAnimeError(
        "invalid anime episode id",
        getEpisodeServers.name,
        400
      );
    }
    const epId = episodeId.split("?ep=")[1];
    const { data } = await client.get(
      `${SRC_AJAX_URL}/v2/episode/servers?episodeId=${epId}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: new URL(`/watch/${episodeId}`, SRC_BASE_URL).href
        }
      }
    );
    const $ = load7(data.html);
    const epNoSelector = ".server-notice strong";
    res.episodeNo = Number($(epNoSelector).text().split(" ").pop()) || 0;
    $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each(
      (_, el) => {
        res.sub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || null
        });
      }
    );
    $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each(
      (_, el) => {
        res.dub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || null
        });
      }
    );
    $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each(
      (_, el) => {
        res.raw.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || null
        });
      }
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getEpisodeServers.name);
  }
}

// src/hianime/scrapers/animeAboutInfo.ts
import { load as load8 } from "cheerio";
async function getAnimeAboutInfo(animeId) {
  const res = {
    anime: {
      info: {
        id: null,
        anilistId: null,
        malId: null,
        name: null,
        poster: null,
        description: null,
        stats: {
          rating: null,
          quality: null,
          episodes: {
            sub: null,
            dub: null
          },
          type: null,
          duration: null
        },
        promotionalVideos: [],
        charactersVoiceActors: []
      },
      moreInfo: {}
    },
    seasons: [],
    mostPopularAnimes: [],
    relatedAnimes: [],
    recommendedAnimes: []
  };
  try {
    if (animeId.trim() === "" || animeId.indexOf("-") === -1) {
      throw new HiAnimeError("invalid anime id", getAnimeAboutInfo.name, 400);
    }
    const animeUrl = new URL(animeId, SRC_BASE_URL);
    const mainPage = await client.get(animeUrl.href);
    const $ = load8(mainPage.data);
    try {
      res.anime.info.anilistId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id
      );
      res.anime.info.malId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.mal_id
      );
    } catch (err) {
      res.anime.info.anilistId = null;
      res.anime.info.malId = null;
    }
    const selector = "#ani_detail .container .anis-content";
    res.anime.info.id = $(selector)?.find(".anisc-detail .film-buttons a.btn-play")?.attr("href")?.split("/")?.pop() || null;
    res.anime.info.name = $(selector)?.find(".anisc-detail .film-name.dynamic-name")?.text()?.trim() || null;
    res.anime.info.description = $(selector)?.find(".anisc-detail .film-description .text").text()?.split("[")?.shift()?.trim() || null;
    res.anime.info.poster = $(selector)?.find(".film-poster .film-poster-img")?.attr("src")?.trim() || null;
    res.anime.info.stats.rating = $(`${selector} .film-stats .tick .tick-pg`)?.text()?.trim() || null;
    res.anime.info.stats.quality = $(`${selector} .film-stats .tick .tick-quality`)?.text()?.trim() || null;
    res.anime.info.stats.episodes = {
      sub: Number($(`${selector} .film-stats .tick .tick-sub`)?.text()?.trim()) || null,
      dub: Number($(`${selector} .film-stats .tick .tick-dub`)?.text()?.trim()) || null
    };
    res.anime.info.stats.type = $(`${selector} .film-stats .tick`)?.text()?.trim()?.replace(/[\s\n]+/g, " ")?.split(" ")?.at(-2) || null;
    res.anime.info.stats.duration = $(`${selector} .film-stats .tick`)?.text()?.trim()?.replace(/[\s\n]+/g, " ")?.split(" ")?.pop() || null;
    $(
      ".block_area.block_area-promotions .block_area-promotions-list .screen-items .item"
    ).each((_, el) => {
      res.anime.info.promotionalVideos.push({
        title: $(el).attr("data-title"),
        source: $(el).attr("data-src"),
        thumbnail: $(el).find("img").attr("src")
      });
    });
    $(
      ".block_area.block_area-actors .block-actors-content .bac-list-wrap .bac-item"
    ).each((_, el) => {
      res.anime.info.charactersVoiceActors.push({
        character: {
          id: $(el).find($(".per-info.ltr .pi-avatar")).attr("href")?.split("/")[2] || "",
          poster: $(el).find($(".per-info.ltr .pi-avatar img")).attr("data-src") || "",
          name: $(el).find($(".per-info.ltr .pi-detail a")).text(),
          cast: $(el).find($(".per-info.ltr .pi-detail .pi-cast")).text()
        },
        voiceActor: {
          id: $(el).find($(".per-info.rtl .pi-avatar")).attr("href")?.split("/")[2] || "",
          poster: $(el).find($(".per-info.rtl .pi-avatar img")).attr("data-src") || "",
          name: $(el).find($(".per-info.rtl .pi-detail a")).text(),
          cast: $(el).find($(".per-info.rtl .pi-detail .pi-cast")).text()
        }
      });
    });
    $(`${selector} .anisc-info-wrap .anisc-info .item:not(.w-hide)`).each(
      (_, el) => {
        let key = $(el).find(".item-head").text().toLowerCase().replace(":", "").trim();
        key = key.includes(" ") ? key.replace(" ", "") : key;
        const value = [
          ...$(el).find("*:not(.item-head)").map((_2, el2) => $(el2).text().trim())
        ].map((i2) => `${i2}`).toString().trim();
        if (key === "genres") {
          res.anime.moreInfo[key] = value.split(",").map((i2) => i2.trim());
          return;
        }
        if (key === "producers") {
          res.anime.moreInfo[key] = value.split(",").map((i2) => i2.trim());
          return;
        }
        res.anime.moreInfo[key] = value;
      }
    );
    const seasonsSelector = "#main-content .os-list a.os-item";
    $(seasonsSelector).each((_, el) => {
      res.seasons.push({
        id: $(el)?.attr("href")?.slice(1)?.trim() || null,
        name: $(el)?.attr("title")?.trim() || null,
        title: $(el)?.find(".title")?.text()?.trim(),
        poster: $(el)?.find(".season-poster")?.attr("style")?.split(" ")?.pop()?.split("(")?.pop()?.split(")")[0] || null,
        isCurrent: $(el).hasClass("active")
      });
    });
    const relatedAnimeSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(1) .anif-block-ul ul li";
    res.relatedAnimes = extractMostPopularAnimes(
      $,
      relatedAnimeSelector,
      getAnimeAboutInfo.name
    );
    const mostPopularSelector = "#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(2) .anif-block-ul ul li";
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      mostPopularSelector,
      getAnimeAboutInfo.name
    );
    const recommendedAnimeSelector = "#main-content .block_area.block_area_category .tab-content .flw-item";
    res.recommendedAnimes = extractAnimes(
      $,
      recommendedAnimeSelector,
      getAnimeAboutInfo.name
    );
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeAboutInfo.name);
  }
}

// src/hianime/scrapers/estimatedSchedule.ts
import { load as load9 } from "cheerio";
async function getEstimatedSchedule(date) {
  const res = {
    scheduledAnimes: []
  };
  try {
    date = date?.trim();
    if (date === "" || /^\d{4}-\d{2}-\d{2}$/.test(date) === false) {
      throw new HiAnimeError(
        "invalid date format",
        getEstimatedSchedule.name,
        400
      );
    }
    const estScheduleURL = `${SRC_AJAX_URL}/schedule/list?tzOffset=-330&date=${date}`;
    const mainPage = await client.get(estScheduleURL, {
      headers: {
        Accept: "*/*",
        Referer: SRC_HOME_URL,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    const $ = load9(mainPage?.data?.html);
    const selector = "li";
    if ($(selector)?.text()?.trim()?.includes("No data to display")) {
      return res;
    }
    $(selector).each((_, el) => {
      const airingTimestamp = (/* @__PURE__ */ new Date(
        `${date}T${$(el)?.find("a .time")?.text()?.trim()}:00`
      )).getTime();
      res.scheduledAnimes.push({
        id: $(el)?.find("a")?.attr("href")?.slice(1)?.trim() || null,
        time: $(el)?.find("a .time")?.text()?.trim() || null,
        name: $(el)?.find("a .film-name.dynamic-name")?.text()?.trim() || null,
        jname: $(el)?.find("a .film-name.dynamic-name")?.attr("data-jname")?.trim() || null,
        airingTimestamp,
        secondsUntilAiring: Math.floor((airingTimestamp - Date.now()) / 1e3),
        episode: Number(
          $(el).find("a .fd-play button").text().trim().split(" ")[1]
        )
      });
    });
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getEstimatedSchedule.name);
  }
}

// src/hianime/scrapers/animeEpisodeSrcs.ts
import axios6 from "axios";
import { load as load11 } from "cheerio";

// src/extractors/streamsb.ts
import axios2 from "axios";
var StreamSB = class {
  // private serverName = "streamSB";
  sources = [];
  host = "https://watchsb.com/sources50";
  host2 = "https://streamsss.net/sources16";
  PAYLOAD(hex) {
    return `566d337678566f743674494a7c7c${hex}7c7c346b6767586d6934774855537c7c73747265616d7362/6565417268755339773461447c7c346133383438333436313335376136323337373433383634376337633465366534393338373136643732373736343735373237613763376334363733353737303533366236333463353333363534366137633763373337343732363536313664373336327c7c6b586c3163614468645a47617c7c73747265616d7362`;
  }
  async extract(videoUrl, isAlt = false) {
    let headers = {
      watchsb: "sbstream",
      Referer: videoUrl.href,
      "User-Agent": USER_AGENT_HEADER
    };
    let id = videoUrl.href.split("/e/").pop();
    if (id?.includes("html")) {
      id = id.split(".html")[0];
    }
    const bytes = new TextEncoder().encode(id);
    const res = await axios2.get(
      `${isAlt ? this.host2 : this.host}/${this.PAYLOAD(
        Buffer.from(bytes).toString("hex")
      )}`,
      { headers }
    ).catch(() => null);
    if (!res?.data.stream_data) {
      throw new Error("No source found. Try a different server");
    }
    headers = {
      "User-Agent": USER_AGENT_HEADER,
      Referer: videoUrl.href.split("e/")[0]
    };
    const m3u8_urls = await axios2.get(res.data.stream_data.file, {
      headers
    });
    const videoList = m3u8_urls?.data?.split("#EXT-X-STREAM-INF:") ?? [];
    for (const video of videoList) {
      if (!video.includes("m3u8")) continue;
      const url = video.split("\n")[1];
      const quality = video.split("RESOLUTION=")[1].split(",")[0].split("x")[1];
      this.sources.push({
        url,
        quality: `${quality}p`,
        isM3U8: true
      });
    }
    this.sources.push({
      url: res.data.stream_data.file,
      quality: "auto",
      isM3U8: res.data.stream_data.file.includes(".m3u8")
    });
    return this.sources;
  }
  // private addSources(source: any): void {
  //   this.sources.push({
  //     url: source.file,
  //     isM3U8: source.file.includes(".m3u8"),
  //   });
  // }
};
var streamsb_default = StreamSB;

// src/extractors/streamtape.ts
import axios3 from "axios";
import { load as load10 } from "cheerio";
var StreamTape = class {
  // private serverName = "StreamTape";
  sources = [];
  async extract(videoUrl) {
    try {
      const { data } = await axios3.get(videoUrl.href).catch(() => {
        throw new Error("Video not found");
      });
      const $ = load10(data);
      let [fh, sh] = $.html()?.match(/robotlink'\).innerHTML = (.*)'/)[1].split("+ ('");
      sh = sh.substring(3);
      fh = fh.replace(/\'/g, "");
      const url = `https:${fh}${sh}`;
      this.sources.push({
        url,
        isM3U8: url.includes(".m3u8")
      });
      return this.sources;
    } catch (err) {
      throw new Error(err.message);
    }
  }
};
var streamtape_default = StreamTape;

// src/extractors/rapidcloud.ts
import axios4 from "axios";
import CryptoJS from "crypto-js";
var RapidCloud = class {
  // private serverName = "RapidCloud";
  sources = [];
  // https://rapid-cloud.co/embed-6/eVZPDXwVfrY3?vast=1
  fallbackKey = "c1d17096f2ca11b7";
  host = "https://rapid-cloud.co";
  async extract(videoUrl) {
    const result = {
      sources: [],
      subtitles: []
    };
    try {
      const id = videoUrl.href.split("/").pop()?.split("?")[0];
      const options = {
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      };
      let res = null;
      res = await axios4.get(
        `https://${videoUrl.hostname}/embed-2/ajax/e-1/getSources?id=${id}`,
        options
      );
      let {
        data: { sources, tracks, intro, outro, encrypted }
      } = res;
      let decryptKey = await (await axios4.get(
        "https://raw.githubusercontent.com/cinemaxhq/keys/e1/key"
      )).data;
      decryptKey = substringBefore(
        substringAfter(decryptKey, '"blob-code blob-code-inner js-file-line">'),
        "</td>"
      );
      if (!decryptKey) {
        decryptKey = await (await axios4.get(
          "https://raw.githubusercontent.com/cinemaxhq/keys/e1/key"
        )).data;
      }
      if (!decryptKey) decryptKey = this.fallbackKey;
      try {
        if (encrypted) {
          const sourcesArray = sources.split("");
          let extractedKey = "";
          let currentIndex = 0;
          for (const index2 of decryptKey) {
            const start = index2[0] + currentIndex;
            const end = start + index2[1];
            for (let i2 = start; i2 < end; i2++) {
              extractedKey += res.data.sources[i2];
              sourcesArray[i2] = "";
            }
            currentIndex += index2[1];
          }
          decryptKey = extractedKey;
          sources = sourcesArray.join("");
          const decrypt = CryptoJS.AES.decrypt(sources, decryptKey);
          sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
        }
      } catch (err) {
        console.log(err.message);
        throw new Error("Cannot decrypt sources. Perhaps the key is invalid.");
      }
      this.sources = sources?.map((s) => ({
        url: s.file,
        isM3U8: s.file.includes(".m3u8")
      }));
      result.sources.push(...this.sources);
      if (videoUrl.href.includes(new URL(this.host).host)) {
        result.sources = [];
        this.sources = [];
        for (const source of sources) {
          const { data } = await axios4.get(source.file, options);
          const m3u8data = data.split("\n").filter(
            (line) => line.includes(".m3u8") && line.includes("RESOLUTION=")
          );
          const secondHalf = m3u8data.map(
            (line) => line.match(/RESOLUTION=.*,(C)|URI=.*/g)?.map((s) => s.split("=")[1])
          );
          const TdArray = secondHalf.map((s) => {
            const f1 = s[0].split(",C")[0];
            const f2 = s[1].replace(/"/g, "");
            return [f1, f2];
          });
          for (const [f1, f2] of TdArray) {
            this.sources.push({
              url: `${source.file?.split("master.m3u8")[0]}${f2.replace(
                "iframes",
                "index"
              )}`,
              quality: f1.split("x")[1] + "p",
              isM3U8: f2.includes(".m3u8")
            });
          }
          result.sources.push(...this.sources);
        }
      }
      result.intro = intro?.end > 1 ? { start: intro.start, end: intro.end } : void 0;
      result.outro = outro?.end > 1 ? { start: outro.start, end: outro.end } : void 0;
      result.sources.push({
        url: sources[0].file,
        isM3U8: sources[0].file.includes(".m3u8"),
        quality: "auto"
      });
      result.subtitles = tracks.map(
        (s) => s.file ? { url: s.file, lang: s.label ? s.label : "Thumbnails" } : null
      ).filter((s) => s);
      return result;
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
};
var rapidcloud_default = RapidCloud;

// src/extractors/megacloud.ts
import axios5 from "axios";
import crypto2 from "crypto";

// src/extractors/megacloud.decodedpng.ts
var decoded_png = new Uint8ClampedArray([246, 246, 246, 255, 226, 234, 236, 255, 113, 170, 187, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 0, 255, 255, 1, 60, 139, 163, 192, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 130, 180, 196, 254, 242, 243, 244, 254, 246, 246, 246, 254, 243, 244, 245, 254, 105, 165, 184, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 132, 181, 196, 254, 243, 245, 245, 254, 188, 212, 220, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 63, 142, 165, 254, 217, 230, 233, 254, 132, 181, 196, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 177, 206, 216, 254, 119, 174, 190, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 164, 198, 210, 255, 119, 174, 190, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 255, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 165, 254, 60, 140, 164, 254, 60, 140, 164, 254, 60, 140, 164, 255, 163, 198, 210, 254, 119, 174, 190, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 255, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 255, 60, 139, 164, 254, 163, 198, 210, 254, 119, 174, 190, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 255, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 139, 164, 254, 60, 140, 164, 255, 60, 139, 164, 254, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 131, 180, 195, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 233, 239, 240, 255, 218, 230, 234, 255, 143, 187, 200, 255, 66, 143, 167, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 223, 233, 236, 255, 136, 183, 197, 255, 69, 145, 168, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 184, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 242, 243, 244, 255, 219, 231, 235, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 217, 229, 233, 255, 97, 160, 180, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 184, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 241, 243, 244, 255, 227, 235, 238, 255, 243, 245, 245, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 230, 237, 239, 255, 239, 242, 243, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 233, 239, 241, 255, 235, 239, 241, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 239, 242, 243, 255, 230, 236, 239, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 216, 230, 233, 255, 94, 160, 179, 255, 66, 143, 166, 255, 99, 161, 182, 255, 221, 232, 236, 255, 246, 246, 246, 255, 245, 245, 245, 255, 127, 178, 194, 255, 68, 144, 168, 255, 79, 150, 173, 255, 187, 213, 220, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 154, 193, 205, 255, 73, 147, 170, 255, 72, 146, 169, 255, 156, 194, 206, 255, 246, 246, 246, 255, 246, 246, 246, 255, 208, 223, 229, 255, 85, 154, 176, 255, 65, 143, 166, 255, 112, 169, 187, 255, 236, 240, 242, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 137, 184, 197, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 88, 156, 177, 255, 210, 226, 230, 255, 133, 181, 196, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 85, 154, 175, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 239, 242, 243, 255, 64, 143, 166, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 146, 189, 202, 255, 203, 221, 227, 255, 70, 145, 168, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 165, 200, 210, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 137, 183, 198, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 67, 144, 167, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 86, 154, 175, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 237, 241, 242, 255, 64, 142, 166, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 64, 141, 166, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 164, 200, 211, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 163, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 184, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 218, 230, 234, 255, 83, 153, 174, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 67, 144, 167, 255, 174, 206, 215, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 153, 193, 205, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 101, 163, 182, 255, 226, 235, 238, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 213, 227, 231, 255, 85, 154, 175, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 64, 142, 165, 255, 178, 208, 216, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 242, 243, 244, 255, 148, 189, 203, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 97, 160, 180, 255, 231, 238, 240, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 244, 245, 245, 255, 112, 169, 187, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 67, 143, 167, 255, 229, 236, 239, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 200, 220, 226, 255, 61, 141, 165, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 140, 186, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 235, 240, 242, 255, 133, 181, 196, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 86, 155, 176, 255, 221, 232, 236, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 203, 221, 227, 255, 70, 145, 168, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 150, 191, 204, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 165, 199, 210, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 115, 171, 188, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 245, 245, 245, 255, 83, 153, 174, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 61, 141, 165, 255, 192, 215, 222, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 131, 181, 196, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 67, 143, 168, 255, 140, 185, 200, 255, 83, 153, 174, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 79, 151, 173, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 231, 238, 240, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 89, 156, 177, 255, 124, 176, 192, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 158, 195, 207, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 181, 208, 217, 255, 68, 144, 167, 255, 60, 139, 164, 255, 64, 141, 166, 255, 174, 205, 214, 255, 245, 246, 246, 255, 209, 224, 229, 255, 81, 151, 173, 255, 60, 139, 164, 255, 60, 139, 164, 255, 129, 179, 194, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 245, 246, 246, 255, 104, 165, 184, 255, 60, 139, 164, 255, 60, 139, 164, 255, 96, 160, 180, 255, 231, 237, 239, 255, 242, 244, 244, 255, 140, 185, 200, 255, 60, 139, 164, 255, 60, 139, 164, 255, 68, 144, 168, 255, 205, 222, 228, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 163, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 192, 215, 222, 255, 155, 194, 206, 255, 194, 216, 223, 255, 245, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 220, 231, 235, 255, 160, 197, 208, 255, 177, 207, 215, 255, 238, 242, 242, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 227, 236, 237, 255, 169, 202, 212, 255, 169, 202, 212, 255, 226, 234, 237, 255, 246, 246, 246, 255, 246, 246, 246, 255, 242, 244, 244, 255, 183, 210, 219, 255, 155, 194, 206, 255, 205, 222, 228, 255, 245, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 184, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 215, 229, 233, 255, 222, 233, 236, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 223, 233, 236, 255, 213, 227, 232, 255, 245, 245, 245, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 242, 244, 244, 255, 111, 169, 186, 255, 60, 140, 165, 255, 64, 142, 166, 255, 132, 181, 196, 255, 216, 229, 233, 255, 246, 246, 246, 255, 246, 246, 246, 255, 222, 233, 236, 255, 164, 199, 210, 255, 97, 161, 180, 255, 73, 147, 170, 255, 106, 166, 184, 255, 178, 207, 216, 255, 235, 239, 242, 255, 246, 246, 246, 255, 241, 243, 244, 255, 201, 221, 226, 255, 117, 172, 189, 255, 61, 141, 165, 255, 61, 140, 164, 255, 138, 185, 198, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 196, 217, 224, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 74, 147, 171, 255, 132, 181, 195, 255, 150, 191, 204, 255, 77, 149, 172, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 95, 160, 180, 255, 158, 196, 207, 255, 120, 173, 191, 255, 61, 140, 165, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 63, 141, 165, 255, 230, 237, 239, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 163, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 202, 221, 226, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 67, 144, 167, 255, 236, 241, 242, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 136, 183, 198, 255, 64, 142, 166, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 165, 255, 71, 145, 168, 255, 153, 192, 205, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 173, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 206, 224, 229, 255, 118, 172, 190, 255, 64, 141, 165, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 95, 160, 180, 255, 143, 187, 200, 255, 87, 155, 176, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 63, 141, 165, 255, 134, 181, 196, 255, 225, 235, 237, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 163, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 184, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 212, 227, 231, 255, 129, 179, 194, 255, 89, 157, 177, 255, 85, 154, 175, 255, 111, 169, 187, 255, 183, 210, 219, 255, 246, 246, 246, 255, 246, 246, 246, 255, 243, 245, 245, 255, 172, 203, 213, 255, 106, 165, 184, 255, 83, 153, 174, 255, 93, 159, 179, 255, 142, 187, 201, 255, 221, 231, 235, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 244, 245, 246, 255, 244, 245, 245, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 243, 244, 245, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 163, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 119, 174, 190, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 139, 185, 199, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 246, 246, 246, 255, 102, 164, 183, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 163, 198, 210, 255, 129, 180, 195, 255, 60, 140, 164, 255, 60, 140, 165, 255, 60, 140, 164, 255, 93, 158, 178, 255, 158, 196, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 159, 197, 207, 255, 156, 194, 207, 255, 69, 144, 168, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 169, 202, 212, 255, 176, 206, 215, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 203, 221, 227, 255, 234, 239, 240, 255, 84, 153, 175, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 107, 167, 185, 255, 241, 243, 244, 255, 246, 246, 246, 255, 203, 221, 227, 255, 85, 154, 176, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 60, 139, 164, 255, 60, 140, 164, 255, 60, 139, 164, 255, 92, 157, 179, 255, 222, 232, 236, 255, 246, 246, 246, 255]);

// src/extractors/megacloud.getsrcs.ts
import util from "util";
import CryptoJS2 from "crypto-js";
import { webcrypto } from "crypto";
var embed_url = "https://megacloud.tv/embed-2/e-1/";
var referrer = SRC_BASE_URL;
var user_agent = USER_AGENT_HEADER;
var crypto = webcrypto;
var wasm;
var arr = new Array(128).fill(void 0);
var dateNow = Date.now();
var content = "";
function isDetached(buffer) {
  if (buffer.byteLength === 0) {
    const formatted = util.format(buffer);
    return formatted.includes("detached");
  }
  return false;
}
var dataURL = "data:image/png;base64,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JDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAt8D/ATY93seMmImHAAAAAElFTkSuQmCC";
var meta = {
  content
};
var image_data = {
  height: 50,
  width: 65,
  data: decoded_png
};
var canvas = {
  baseUrl: "https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1",
  width: 0,
  height: 0,
  style: {
    style: {
      display: "inline"
    }
  },
  context2d: {}
};
var fake_window = {
  localStorage: {
    setItem: function(item, value) {
      fake_window.localStorage[item] = value;
    }
  },
  navigator: {
    webdriver: false,
    userAgent: user_agent
  },
  length: 0,
  document: {
    cookie: ""
  },
  origin: "https://megacloud.tv",
  location: {
    href: "https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1",
    origin: "https://megacloud.tv"
  },
  performance: {
    timeOrigin: dateNow
  },
  xrax: "",
  c: false,
  G: "",
  z: function(a) {
    return [
      (4278190080 & a) >> 24,
      (16711680 & a) >> 16,
      (65280 & a) >> 8,
      255 & a
    ];
  },
  crypto,
  msCrypto: crypto,
  browser_version: 1878522368
};
var nodeList = {
  image: {
    src: "https://megacloud.tv/images/image.png?v=0.1.0",
    height: 50,
    width: 65,
    complete: true
  },
  context2d: {},
  length: 1
};
function get(index2) {
  return arr[index2];
}
arr.push(void 0, null, true, false);
var size = 0;
var memoryBuff;
function getMemBuff() {
  return memoryBuff = null !== memoryBuff && 0 !== memoryBuff.byteLength ? memoryBuff : new Uint8Array(wasm.memory.buffer);
}
var encoder = new TextEncoder();
var encode = function(text, array) {
  return encoder.encodeInto(text, array);
};
function parse(text, func, func2) {
  if (void 0 === func2) {
    var encoded = encoder.encode(text);
    const parsedIndex = func(encoded.length, 1) >>> 0;
    return getMemBuff().subarray(parsedIndex, parsedIndex + encoded.length).set(encoded), size = encoded.length, parsedIndex;
  }
  let len = text.length;
  let parsedLen = func(len, 1) >>> 0;
  var new_arr = getMemBuff();
  let i2 = 0;
  for (; i2 < len; i2++) {
    var char = text.charCodeAt(i2);
    if (127 < char) {
      break;
    }
    new_arr[parsedLen + i2] = char;
  }
  return i2 !== len && (0 !== i2 && (text = text.slice(i2)), parsedLen = func2(parsedLen, len, len = i2 + 3 * text.length, 1) >>> 0, encoded = getMemBuff().subarray(parsedLen + i2, parsedLen + len), i2 += encode(text, encoded).written, parsedLen = func2(parsedLen, len, i2, 1) >>> 0), size = i2, parsedLen;
}
var dataView;
function isNull(test) {
  return null == test;
}
function getDataView() {
  return dataView = dataView === null || isDetached(dataView.buffer) || dataView.buffer !== wasm.memory.buffer ? new DataView(wasm.memory.buffer) : dataView;
}
var pointer = arr.length;
function shift(QP) {
  QP < 132 || (arr[QP] = pointer, pointer = QP);
}
function shiftGet(QP) {
  var Qn = get(QP);
  return shift(QP), Qn;
}
var decoder = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true
});
function decodeSub(index2, offset2) {
  return index2 >>>= 0, decoder.decode(getMemBuff().subarray(index2, index2 + offset2));
}
function addToStack(item) {
  pointer === arr.length && arr.push(arr.length + 1);
  var Qn = pointer;
  return pointer = arr[Qn], arr[Qn] = item, Qn;
}
function args(QP, Qn, QT, func) {
  const Qx = {
    a: QP,
    b: Qn,
    cnt: 1,
    dtor: QT
  };
  return QP = (...Qw) => {
    Qx.cnt++;
    try {
      return func(Qx.a, Qx.b, ...Qw);
    } finally {
      0 == --Qx.cnt && (wasm.__wbindgen_export_2.get(Qx.dtor)(Qx.a, Qx.b), Qx.a = 0);
    }
  }, QP.original = Qx, QP;
}
function export3(QP, Qn) {
  return shiftGet(wasm.__wbindgen_export_3(QP, Qn));
}
function export4(Qy, QO, QX) {
  wasm.__wbindgen_export_4(Qy, QO, addToStack(QX));
}
function export5(QP, Qn) {
  wasm.__wbindgen_export_5(QP, Qn);
}
function applyToWindow(func, args2) {
  try {
    return func.apply(fake_window, args2);
  } catch (error) {
    wasm.__wbindgen_export_6(addToStack(error));
  }
}
function Qj(QP, Qn) {
  return Qn = Qn(+QP.length, 1) >>> 0, getMemBuff().set(QP, Qn), size = QP.length, Qn;
}
function isResponse(obj) {
  return Object.prototype.toString.call(obj) === "[object Response]";
}
async function QN(QP, Qn) {
  let QT, Qt;
  return "function" == typeof Response && isResponse(QP) ? (QT = await QP.arrayBuffer(), Qt = await WebAssembly.instantiate(QT, Qn), Object.assign(Qt, { bytes: QT })) : (Qt = await WebAssembly.instantiate(QP, Qn)) instanceof WebAssembly.Instance ? {
    instance: Qt,
    module: QP
  } : Qt;
}
function initWasm() {
  const wasmObj = {
    wbg: {
      __wbindgen_is_function: function(index2) {
        return typeof get(index2) == "function";
      },
      __wbindgen_is_string: function(index2) {
        return typeof get(index2) == "string";
      },
      __wbindgen_is_object: function(index2) {
        let object = get(index2);
        return typeof object == "object" && object !== null;
      },
      __wbindgen_number_get: function(offset2, index2) {
        let number = get(index2);
        getDataView().setFloat64(offset2 + 8, isNull(number) ? 0 : number, true);
        getDataView().setInt32(offset2, isNull(number) ? 0 : 1, true);
      },
      __wbindgen_string_get: function(offset2, index2) {
        let str = get(index2);
        let val = parse(
          str,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1
        );
        getDataView().setInt32(offset2 + 4, size, true);
        getDataView().setInt32(offset2, val, true);
      },
      __wbindgen_object_drop_ref: function(index2) {
        shiftGet(index2);
      },
      __wbindgen_cb_drop: function(index2) {
        let org = shiftGet(index2).original;
        return 1 == org.cnt-- && !(org.a = 0);
      },
      __wbindgen_string_new: function(index2, offset2) {
        return addToStack(decodeSub(index2, offset2));
      },
      __wbindgen_is_null: function(index2) {
        return null === get(index2);
      },
      __wbindgen_is_undefined: function(index2) {
        return void 0 === get(index2);
      },
      __wbindgen_boolean_get: function(index2) {
        let bool = get(index2);
        return "boolean" == typeof bool ? bool ? 1 : 0 : 2;
      },
      __wbg_instanceof_CanvasRenderingContext2d_4ec30ddd3f29f8f9: function() {
        return true;
      },
      __wbg_subarray_adc418253d76e2f1: function(index2, num1, num2) {
        return addToStack(get(index2).subarray(num1 >>> 0, num2 >>> 0));
      },
      __wbg_randomFillSync_5c9c955aa56b6049: function() {
      },
      __wbg_getRandomValues_3aa56aa6edec874c: function() {
        return applyToWindow(function(index1, index2) {
          get(index1).getRandomValues(get(index2));
        }, arguments);
      },
      __wbg_msCrypto_eb05e62b530a1508: function(index2) {
        return addToStack(get(index2).msCrypto);
      },
      // @ts-ignore
      __wbg_toString_6eb7c1f755c00453: function(index2) {
        let fakestr = "[object Storage]";
        return addToStack(fakestr);
      },
      __wbg_toString_139023ab33acec36: function(index2) {
        return addToStack(get(index2).toString());
      },
      __wbg_require_cca90b1a94a0255b: function() {
        return applyToWindow(function() {
          return addToStack(module.require);
        }, arguments);
      },
      __wbg_crypto_1d1f22824a6a080c: function(index2) {
        return addToStack(get(index2).crypto);
      },
      __wbg_process_4a72847cc503995b: function(index2) {
        return addToStack(get(index2).process);
      },
      __wbg_versions_f686565e586dd935: function(index2) {
        return addToStack(get(index2).versions);
      },
      __wbg_node_104a2ff8d6ea03a2: function(index2) {
        return addToStack(get(index2).node);
      },
      __wbg_localStorage_3d538af21ea07fcc: function() {
        return applyToWindow(function(index2) {
          let data = fake_window.localStorage;
          if (isNull(data)) {
            return 0;
          } else {
            return addToStack(data);
          }
        }, arguments);
      },
      __wbg_setfillStyle_59f426135f52910f: function() {
      },
      __wbg_setshadowBlur_229c56539d02f401: function() {
      },
      __wbg_setshadowColor_340d5290cdc4ae9d: function() {
      },
      __wbg_setfont_16d6e31e06a420a5: function() {
      },
      __wbg_settextBaseline_c3266d3bd4a6695c: function() {
      },
      __wbg_drawImage_cb13768a1bdc04bd: function() {
      },
      __wbg_getImageData_66269d289f37d3c7: function() {
        return applyToWindow(function() {
          return addToStack(image_data);
        }, arguments);
      },
      __wbg_rect_2fa1df87ef638738: function() {
      },
      __wbg_fillRect_4dd28e628381d240: function() {
      },
      __wbg_fillText_07e5da9e41652f20: function() {
      },
      __wbg_setProperty_5144ddce66bbde41: function() {
      },
      __wbg_createElement_03cf347ddad1c8c0: function() {
        return applyToWindow(function(index2, decodeIndex, decodeIndexOffset) {
          return addToStack(canvas);
        }, arguments);
      },
      __wbg_querySelector_118a0639aa1f51cd: function() {
        return applyToWindow(function(index2, decodeIndex, decodeOffset) {
          return addToStack(meta);
        }, arguments);
      },
      __wbg_querySelectorAll_50c79cd4f7573825: function() {
        return applyToWindow(function() {
          return addToStack(nodeList);
        }, arguments);
      },
      __wbg_getAttribute_706ae88bd37410fa: function(offset2, index2, decodeIndex, decodeOffset) {
        let attr = meta.content;
        let todo = isNull(attr) ? 0 : parse(attr, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        getDataView().setInt32(offset2 + 4, size, true);
        getDataView().setInt32(offset2, todo, true);
      },
      __wbg_target_6795373f170fd786: function(index2) {
        let target = get(index2).target;
        return isNull(target) ? 0 : addToStack(target);
      },
      __wbg_addEventListener_f984e99465a6a7f4: function() {
      },
      __wbg_instanceof_HtmlCanvasElement_1e81f71f630e46bc: function() {
        return true;
      },
      __wbg_setwidth_233645b297bb3318: function(index2, set) {
        get(index2).width = set >>> 0;
      },
      __wbg_setheight_fcb491cf54e3527c: function(index2, set) {
        get(index2).height = set >>> 0;
      },
      __wbg_getContext_dfc91ab0837db1d1: function() {
        return applyToWindow(function(index2) {
          return addToStack(get(index2).context2d);
        }, arguments);
      },
      __wbg_toDataURL_97b108dd1a4b7454: function() {
        return applyToWindow(function(offset2, index2) {
          let _dataUrl = parse(
            dataURL,
            wasm.__wbindgen_export_0,
            wasm.__wbindgen_export_1
          );
          getDataView().setInt32(offset2 + 4, size, true);
          getDataView().setInt32(offset2, _dataUrl, true);
        }, arguments);
      },
      __wbg_instanceof_HtmlDocument_1100f8a983ca79f9: function() {
        return true;
      },
      __wbg_style_ca229e3326b3c3fb: function(index2) {
        addToStack(get(index2).style);
      },
      __wbg_instanceof_HtmlImageElement_9c82d4e3651a8533: function() {
        return true;
      },
      __wbg_src_87a0e38af6229364: function(offset2, index2) {
        let _src = parse(
          get(index2).src,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1
        );
        getDataView().setInt32(offset2 + 4, size, true);
        getDataView().setInt32(offset2, _src, true);
      },
      __wbg_width_e1a38bdd483e1283: function(index2) {
        return get(index2).width;
      },
      __wbg_height_e4cc2294187313c9: function(index2) {
        return get(index2).height;
      },
      __wbg_complete_1162c2697406af11: function(index2) {
        return get(index2).complete;
      },
      __wbg_data_d34dc554f90b8652: function(offset2, index2) {
        var _data = Qj(get(index2).data, wasm.__wbindgen_export_0);
        getDataView().setInt32(offset2 + 4, size, true);
        getDataView().setInt32(offset2, _data, true);
      },
      __wbg_origin_305402044aa148ce: function() {
        return applyToWindow(function(offset2, index2) {
          let _origin = parse(
            get(index2).origin,
            wasm.__wbindgen_export_0,
            wasm.__wbindgen_export_1
          );
          getDataView().setInt32(offset2 + 4, size, true);
          getDataView().setInt32(offset2, _origin, true);
        }, arguments);
      },
      __wbg_length_8a9352f7b7360c37: function(index2) {
        return get(index2).length;
      },
      __wbg_get_c30ae0782d86747f: function(index2) {
        let _image = get(index2).image;
        return isNull(_image) ? 0 : addToStack(_image);
      },
      __wbg_timeOrigin_f462952854d802ec: function(index2) {
        return get(index2).timeOrigin;
      },
      __wbg_instanceof_Window_cee7a886d55e7df5: function() {
        return true;
      },
      __wbg_document_eb7fd66bde3ee213: function(index2) {
        let _document = get(index2).document;
        return isNull(_document) ? 0 : addToStack(_document);
      },
      __wbg_location_b17760ac7977a47a: function(index2) {
        return addToStack(get(index2).location);
      },
      __wbg_performance_4ca1873776fdb3d2: function(index2) {
        let _performance = get(index2).performance;
        return isNull(_performance) ? 0 : addToStack(_performance);
      },
      __wbg_origin_e1f8acdeb3a39a2b: function(offset2, index2) {
        let _origin = parse(
          get(index2).origin,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1
        );
        getDataView().setInt32(offset2 + 4, size, true);
        getDataView().setInt32(offset2, _origin, true);
      },
      __wbg_get_8986951b1ee310e0: function(index2, decode1, decode2) {
        let data = get(index2)[decodeSub(decode1, decode2)];
        return isNull(data) ? 0 : addToStack(data);
      },
      __wbg_setTimeout_6ed7182ebad5d297: function() {
        return applyToWindow(function() {
          return 7;
        }, arguments);
      },
      __wbg_self_05040bd9523805b9: function() {
        return applyToWindow(function() {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_window_adc720039f2cb14f: function() {
        return applyToWindow(function() {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_globalThis_622105db80c1457d: function() {
        return applyToWindow(function() {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_global_f56b013ed9bcf359: function() {
        return applyToWindow(function() {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_newnoargs_cfecb3965268594c: function(index2, offset2) {
        return addToStack(new Function(decodeSub(index2, offset2)));
      },
      __wbindgen_object_clone_ref: function(index2) {
        return addToStack(get(index2));
      },
      __wbg_eval_c824e170787ad184: function() {
        return applyToWindow(function(index, offset) {
          let fake_str = "fake_" + decodeSub(index, offset);
          let ev = eval(fake_str);
          return addToStack(ev);
        }, arguments);
      },
      __wbg_call_3f093dd26d5569f8: function() {
        return applyToWindow(function(index2, index22) {
          return addToStack(get(index2).call(get(index22)));
        }, arguments);
      },
      __wbg_call_67f2111acd2dfdb6: function() {
        return applyToWindow(
          function(index2, index22, index3) {
            return addToStack(get(index2).call(get(index22), get(index3)));
          },
          arguments
        );
      },
      __wbg_set_961700853a212a39: function() {
        return applyToWindow(
          function(index2, index22, index3) {
            return Reflect.set(get(index2), get(index22), get(index3));
          },
          arguments
        );
      },
      __wbg_buffer_b914fb8b50ebbc3e: function(index2) {
        return addToStack(get(index2).buffer);
      },
      __wbg_newwithbyteoffsetandlength_0de9ee56e9f6ee6e: function(index2, val, val2) {
        return addToStack(new Uint8Array(get(index2), val >>> 0, val2 >>> 0));
      },
      __wbg_newwithlength_0d03cef43b68a530: function(length) {
        return addToStack(new Uint8Array(length >>> 0));
      },
      __wbg_new_b1f2d6842d615181: function(index2) {
        return addToStack(new Uint8Array(get(index2)));
      },
      __wbg_buffer_67e624f5a0ab2319: function(index2) {
        return addToStack(get(index2).buffer);
      },
      __wbg_length_21c4b0ae73cba59d: function(index2) {
        return get(index2).length;
      },
      __wbg_set_7d988c98e6ced92d: function(index2, index22, val) {
        get(index2).set(get(index22), val >>> 0);
      },
      __wbindgen_debug_string: function() {
      },
      __wbindgen_throw: function(index2, offset2) {
        throw new Error(decodeSub(index2, offset2));
      },
      __wbindgen_memory: function() {
        return addToStack(wasm.memory);
      },
      __wbindgen_closure_wrapper117: function(Qn, QT) {
        return addToStack(args(Qn, QT, 2, export3));
      },
      __wbindgen_closure_wrapper119: function(Qn, QT) {
        return addToStack(args(Qn, QT, 2, export4));
      },
      __wbindgen_closure_wrapper121: function(Qn, QT) {
        return addToStack(args(Qn, QT, 2, export5));
      },
      __wbindgen_closure_wrapper123: function(Qn, QT) {
        let test = addToStack(args(Qn, QT, 9, export4));
        return test;
      }
    }
  };
  return wasmObj;
}
function assignWasm(resp) {
  wasm = resp.exports;
  dataView = null, memoryBuff = null, wasm;
}
function QZ(QP) {
  let Qn;
  return Qn = initWasm(), QP instanceof WebAssembly.Module || (QP = new WebAssembly.Module(QP)), assignWasm(new WebAssembly.Instance(QP, Qn));
}
async function loadWasm(url) {
  let mod, buffer;
  return mod = initWasm(), {
    instance: url,
    module: mod,
    bytes: buffer
  } = (url = fetch(url), void 0, await QN(await url, mod)), assignWasm(url), buffer;
}
var grootLoader = {
  groot: function() {
    wasm.groot();
  }
};
var wasmLoader = Object.assign(loadWasm, { initSync: QZ }, grootLoader);
var Z = (z2, Q0) => {
  try {
    var Q1 = CryptoJS2.AES.decrypt(z2, Q0);
    return JSON.parse(Q1.toString(CryptoJS2.enc.Utf8));
  } catch (Q2) {
  }
  return [];
};
var R = (z2, Q0) => {
  try {
    for (let Q1 = 0; Q1 < z2.length; Q1++) {
      z2[Q1] = z2[Q1] ^ Q0[Q1 % Q0.length];
    }
  } catch (Q2) {
    return null;
  }
};
function r(z2) {
  return [
    (4278190080 & z2) >> 24,
    (16711680 & z2) >> 16,
    (65280 & z2) >> 8,
    255 & z2
  ];
}
var V = async () => {
  let Q0 = await wasmLoader("https://megacloud.tv/images/loading.png?v=0.0.9");
  fake_window.bytes = Q0;
  try {
    wasmLoader.groot();
  } catch (error) {
    console.log("error: ", error);
  }
  fake_window.jwt_plugin(Q0);
};
var getMeta = async (url) => {
  let resp = await fetch(url, {
    headers: {
      UserAgent: user_agent,
      Referrer: referrer
    }
  });
  let txt = await resp.text();
  let regx = /name="j_crt" content="[A-Za-z0-9]*/g;
  let match = txt.match(regx)?.[0];
  let content2 = match?.slice(match.lastIndexOf('"') + 1);
  meta.content = content2 + "==";
};
var i = (a, P) => {
  try {
    for (let Q0 = 0; Q0 < a.length; Q0++) {
      a[Q0] = a[Q0] ^ P[Q0 % P.length];
    }
  } catch (Q1) {
    return null;
  }
};
var M = (a, P) => {
  try {
    var Q0 = CryptoJS2.AES.decrypt(a, P);
    return JSON.parse(Q0.toString(CryptoJS2.enc.Utf8));
  } catch (Q1) {
    console.log(Q1.message);
  }
  return [];
};
function z(a) {
  return [
    (a & 4278190080) >> 24,
    (a & 16711680) >> 16,
    (a & 65280) >> 8,
    a & 255
  ];
}
async function getSources(xrax) {
  await getMeta(embed_url + xrax + "?k=1");
  fake_window.xrax = xrax;
  fake_window.G = xrax;
  let browser_version = 1878522368;
  try {
    await V();
    let getSourcesUrl = "https://megacloud.tv/embed-2/ajax/e-1/getSources?id=" + fake_window.pid + "&v=" + fake_window.localStorage.kversion + "&h=" + fake_window.localStorage.kid + "&b=" + browser_version;
    console.log(getSourcesUrl, "getSourcesUrl");
    let resp_json = await (await fetch(getSourcesUrl, {
      headers: {
        "User-Agent": user_agent,
        //"Referrer": fake_window.origin + "/v2/embed-4/" + xrax + "?z=",
        // https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1
        Referrer: "https://megacloud.tv/embed-2/e-1/" + xrax + "?k=1"
      },
      method: "GET",
      mode: "cors"
    })).json();
    console.log(resp_json, "resp_json");
    let Q3 = fake_window.localStorage.kversion;
    let Q1 = z(Q3);
    let Q5 = fake_window.navigate();
    Q5 = new Uint8Array(Q5);
    let Q8;
    Q8 = resp_json.t != 0 ? (i(Q5, Q1), Q5) : (Q8 = resp_json.k, i(Q8, Q1), Q8);
    console.log(Q8, Q5, Q1, Q3, "QSHITS");
    const res = resp_json;
    const str = btoa(String.fromCharCode.apply(null, new Uint8Array(Q8)));
    res.sources = M(res.sources, str);
    console.log(res, "response output");
    return res;
  } catch (err) {
    console.error(err);
  }
}

// src/extractors/megacloud.ts
var megacloud = {
  script: "https://megacloud.tv/js/player/a/prod/e1-player.min.js?v=",
  sources: "https://megacloud.tv/embed-2/ajax/e-1/getSources?id="
};
var MegaCloud = class {
  // private serverName = "megacloud";
  async extract(videoUrl) {
    try {
      const extractedData = {
        tracks: [],
        intro: {
          start: 0,
          end: 0
        },
        outro: {
          start: 0,
          end: 0
        },
        sources: []
      };
      const videoId = videoUrl?.href?.split("/")?.pop()?.split("?")[0];
      const { data: srcsData } = await axios5.get(
        megacloud.sources.concat(videoId || ""),
        {
          headers: {
            Accept: "*/*",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            Referer: videoUrl.href
          }
        }
      );
      if (!srcsData) {
        throw new HiAnimeError(
          "Url may have an invalid video id",
          "getAnimeEpisodeSources",
          400
        );
      }
      const encryptedString = srcsData.sources;
      if (!srcsData.encrypted && Array.isArray(encryptedString)) {
        extractedData.intro = srcsData.intro;
        extractedData.outro = srcsData.outro;
        extractedData.tracks = srcsData.tracks;
        extractedData.sources = encryptedString.map((s) => ({
          url: s.file,
          type: s.type
        }));
        return extractedData;
      }
      let text;
      const { data } = await axios5.get(
        megacloud.script.concat(Date.now().toString())
      );
      text = data;
      if (!text) {
        throw new HiAnimeError(
          "Couldn't fetch script to decrypt resource",
          "getAnimeEpisodeSources",
          500
        );
      }
      const vars = this.extractVariables(text);
      if (!vars.length) {
        throw new Error(
          "Can't find variables. Perhaps the extractor is outdated."
        );
      }
      const { secret, encryptedSource } = this.getSecret(
        encryptedString,
        vars
      );
      const decrypted = this.decrypt(encryptedSource, secret);
      try {
        const sources = JSON.parse(decrypted);
        extractedData.intro = srcsData.intro;
        extractedData.outro = srcsData.outro;
        extractedData.tracks = srcsData.tracks;
        extractedData.sources = sources.map((s) => ({
          url: s.file,
          type: s.type
        }));
        return extractedData;
      } catch (error) {
        throw new HiAnimeError(
          "Failed to decrypt resource",
          "getAnimeEpisodeSources",
          500
        );
      }
    } catch (err) {
      throw err;
    }
  }
  extractVariables(text) {
    const regex = /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+)\s*,\s*\w+\s*=\s*(\w+);/g;
    const matches = text.matchAll(regex);
    const vars = Array.from(matches, (match) => {
      const matchKey1 = this.matchingKey(match[1], text);
      const matchKey2 = this.matchingKey(match[2], text);
      try {
        return [parseInt(matchKey1, 16), parseInt(matchKey2, 16)];
      } catch (e) {
        return [];
      }
    }).filter((pair) => pair.length > 0);
    return vars;
  }
  getSecret(encryptedString, values) {
    let secret = "", encryptedSource = "", encryptedSourceArray = encryptedString.split(""), currentIndex = 0;
    for (const index2 of values) {
      const start = index2[0] + currentIndex;
      const end = start + index2[1];
      for (let i2 = start; i2 < end; i2++) {
        secret += encryptedString[i2];
        encryptedSourceArray[i2] = "";
      }
      currentIndex += index2[1];
    }
    encryptedSource = encryptedSourceArray.join("");
    return { secret, encryptedSource };
  }
  decrypt(encrypted, keyOrSecret, maybe_iv) {
    let key;
    let iv;
    let contents;
    if (maybe_iv) {
      key = keyOrSecret;
      iv = maybe_iv;
      contents = encrypted;
    } else {
      const cypher = Buffer.from(encrypted, "base64");
      const salt = cypher.subarray(8, 16);
      const password = Buffer.concat([
        Buffer.from(keyOrSecret, "binary"),
        salt
      ]);
      const md5Hashes = [];
      let digest = password;
      for (let i2 = 0; i2 < 3; i2++) {
        md5Hashes[i2] = crypto2.createHash("md5").update(digest).digest();
        digest = Buffer.concat([md5Hashes[i2], password]);
      }
      key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
      iv = md5Hashes[2];
      contents = cypher.subarray(16);
    }
    const decipher = crypto2.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = decipher.update(
      contents,
      typeof contents === "string" ? "base64" : void 0,
      "utf8"
    ) + decipher.final();
    return decrypted;
  }
  // function copied from github issue #30 'https://github.com/ghoshRitesh12/aniwatch-api/issues/30'
  matchingKey(value, script) {
    const regex = new RegExp(`,${value}=((?:0x)?([0-9a-fA-F]+))`);
    const match = script.match(regex);
    if (match) {
      return match[1].replace(/^0x/, "");
    } else {
      throw new Error("Failed to match the key");
    }
  }
  // https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1
  async extract2(embedIframeURL) {
    try {
      const extractedData = {
        tracks: [],
        intro: {
          start: 0,
          end: 0
        },
        outro: {
          start: 0,
          end: 0
        },
        sources: []
      };
      const xrax = embedIframeURL.pathname.split("/").pop() || "";
      const resp = await getSources(xrax);
      if (!resp) return extractedData;
      if (Array.isArray(resp.sources)) {
        extractedData.sources = resp.sources.map((s) => ({
          url: s.file,
          type: s.type
        }));
      }
      extractedData.intro = resp.intro ? resp.intro : extractedData.intro;
      extractedData.outro = resp.outro ? resp.outro : extractedData.outro;
      extractedData.tracks = resp.tracks;
      return extractedData;
    } catch (err) {
      throw err;
    }
  }
};
var megacloud_default = MegaCloud;

// src/hianime/types/anime.ts
var Servers = /* @__PURE__ */ ((Servers2) => {
  Servers2["VidStreaming"] = "hd-1";
  Servers2["MegaCloud"] = "megacloud";
  Servers2["StreamSB"] = "streamsb";
  Servers2["StreamTape"] = "streamtape";
  Servers2["VidCloud"] = "hd-2";
  Servers2["AsianLoad"] = "asianload";
  Servers2["GogoCDN"] = "gogocdn";
  Servers2["MixDrop"] = "mixdrop";
  Servers2["UpCloud"] = "upcloud";
  Servers2["VizCloud"] = "vizcloud";
  Servers2["MyCloud"] = "mycloud";
  Servers2["Filemoon"] = "filemoon";
  return Servers2;
})(Servers || {});

// src/hianime/scrapers/animeEpisodeSrcs.ts
async function _getAnimeEpisodeSources(episodeId, server = "hd-1" /* VidStreaming */, category = "sub") {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId);
    switch (server) {
      case "hd-1" /* VidStreaming */:
      case "hd-2" /* VidCloud */:
        return {
          // disabled for the timebeing
          // ...(await new MegaCloud().extract(serverUrl)),
          ...await new megacloud_default().extract2(serverUrl)
        };
      case "streamsb" /* StreamSB */:
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent": USER_AGENT_HEADER
          },
          sources: await new streamsb_default().extract(serverUrl, true)
        };
      case "streamtape" /* StreamTape */:
        return {
          headers: { Referer: serverUrl.href, "User-Agent": USER_AGENT_HEADER },
          sources: await new streamtape_default().extract(serverUrl)
        };
      default:
        return {
          headers: { Referer: serverUrl.href },
          ...await new rapidcloud_default().extract(serverUrl)
        };
    }
  }
  const epId = new URL(`/watch/${episodeId}`, SRC_BASE_URL).href;
  console.log("EPISODE_ID: ", epId);
  try {
    const resp = await client.get(
      `${SRC_AJAX_URL}/v2/episode/servers?episodeId=${epId.split("?ep=")[1]}`,
      {
        headers: {
          Referer: epId,
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );
    const $ = load11(resp.data.html);
    let serverId = null;
    try {
      console.log("THE SERVER: ", server);
      switch (server) {
        case "hd-2" /* VidCloud */: {
          serverId = retrieveServerId($, 1, category);
          if (!serverId) throw new Error("RapidCloud not found");
          break;
        }
        case "hd-1" /* VidStreaming */: {
          serverId = retrieveServerId($, 4, category);
          console.log("SERVER_ID: ", serverId);
          if (!serverId) throw new Error("VidStreaming not found");
          break;
        }
        case "streamsb" /* StreamSB */: {
          serverId = retrieveServerId($, 5, category);
          if (!serverId) throw new Error("StreamSB not found");
          break;
        }
        case "streamtape" /* StreamTape */: {
          serverId = retrieveServerId($, 3, category);
          if (!serverId) throw new Error("StreamTape not found");
          break;
        }
      }
    } catch (err) {
      throw new HiAnimeError(
        "Couldn't find server. Try another server",
        getAnimeEpisodeSources.name,
        500
      );
    }
    const {
      data: { link }
    } = await client.get(`${SRC_AJAX_URL}/v2/episode/sources?id=${serverId}`);
    console.log("THE LINK: ", link);
    return await _getAnimeEpisodeSources(link, server);
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeEpisodeSources.name);
  }
}
async function getAnimeEpisodeSources(episodeId, server, category) {
  try {
    if (episodeId === "" || episodeId.indexOf("?ep=") === -1) {
      throw new HiAnimeError(
        "invalid anime episode id",
        getAnimeEpisodeSources.name,
        400
      );
    }
    if (category.trim() === "") {
      throw new HiAnimeError(
        "invalid anime episode category",
        getAnimeEpisodeSources.name,
        400
      );
    }
    let malID;
    let anilistID;
    const animeURL = new URL(episodeId?.split("?ep=")[0], SRC_BASE_URL)?.href;
    const [episodeSrcData, animeSrc] = await Promise.all([
      _getAnimeEpisodeSources(episodeId, server, category),
      axios6.get(animeURL, {
        headers: {
          Referer: SRC_BASE_URL,
          "User-Agent": USER_AGENT_HEADER,
          "X-Requested-With": "XMLHttpRequest"
        }
      })
    ]);
    const $ = load11(animeSrc?.data);
    try {
      anilistID = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id
      );
      malID = Number(JSON.parse($("body")?.find("#syncData")?.text())?.mal_id);
    } catch (err) {
      anilistID = null;
      malID = null;
    }
    return {
      ...episodeSrcData,
      anilistID,
      malID
    };
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeEpisodeSources.name);
  }
}

// src/hianime/scrapers/animeSearchSuggestion.ts
import { load as load12 } from "cheerio";
async function getAnimeSearchSuggestion(q) {
  try {
    const res = {
      suggestions: []
    };
    q = q.trim() ? decodeURIComponent(q.trim()) : "";
    if (q.trim() === "") {
      throw new HiAnimeError(
        "invalid search query",
        getAnimeSearchSuggestion.name,
        400
      );
    }
    const { data } = await client.get(
      `${SRC_AJAX_URL}/search/suggest?keyword=${encodeURIComponent(q)}`,
      {
        headers: {
          Accept: "*/*",
          Pragma: "no-cache",
          Referer: SRC_HOME_URL,
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );
    const $ = load12(data.html);
    const selector = ".nav-item:has(.film-poster)";
    if ($(selector).length < 1) return res;
    $(selector).each((_, el) => {
      const id = $(el).attr("href")?.split("?")[0].includes("javascript") ? null : $(el).attr("href")?.split("?")[0]?.slice(1) || null;
      res.suggestions.push({
        id,
        name: $(el).find(".srp-detail .film-name")?.text()?.trim() || null,
        jname: $(el).find(".srp-detail .film-name")?.attr("data-jname")?.trim() || $(el).find(".srp-detail .alias-name")?.text()?.trim() || null,
        poster: $(el).find(".film-poster .film-poster-img")?.attr("data-src")?.trim() || null,
        moreInfo: [
          ...$(el).find(".film-infor").contents().map((_2, el2) => $(el2).text().trim())
        ].filter((i2) => i2)
      });
    });
    return res;
  } catch (err) {
    throw HiAnimeError.wrapError(err, getAnimeSearchSuggestion.name);
  }
}

// src/hianime/hianime.ts
var Scraper = class {
  /**
   * @param {string} animeId - unique anime id
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getInfo("steinsgate-3")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getInfo(animeId) {
    return getAnimeAboutInfo(animeId);
  }
  /**
   * @param {string} category - anime category
   * @param {number} page - page number, defaults to `1`
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getCategoryAnime("subbed-anime")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getCategoryAnime(category, page = 1) {
    return getAnimeCategory(category, page);
  }
  /**
   * @param {string} animeId - unique anime id
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getEpisodes("steinsgate-3")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getEpisodes(animeId) {
    return getAnimeEpisodes(animeId);
  }
  /**
   * @param {string} episodeId - unique episode id
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getEpisodeSources("steinsgate-3?ep=230", "hd-1", "sub")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getEpisodeSources(episodeId, server = "hd-1" /* VidStreaming */, category = "sub") {
    return getAnimeEpisodeSources(episodeId, server, category);
  }
  /**
   * @param {string} genreName - anime genre name
   * @param {number} page - page number, defaults to `1`
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getGenreAnime("shounen", 2)
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getGenreAnime(genreName, page = 1) {
    return getGenreAnime(genreName, page);
  }
  /**
   * @param {string} producerName - anime producer name
   * @param {number} page - page number, defaults to `1`
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getProducerAnimes("toei-animation", 2)
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getProducerAnimes(producerName, page = 1) {
    return getProducerAnimes(producerName, page);
  }
  /**
   * @param {string} q - search query
   * @param {number} page - page number, defaults to `1`
   * @param {SearchFilters} filters - optional advance search filters
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper();
   *
   * hianime
   *   .search("monster", 1, {
   *     genres: "seinen,psychological",
   *   })
   *   .then((data) => {
   *     console.log(data);
   *   })
   *   .catch((err) => {
   *     console.error(err);
   *   });
   *
   */
  async search(q, page = 1, filters = {}) {
    return getAnimeSearchResults(q, page, filters);
  }
  /**
   * @param {string} q - search query
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.searchSuggestions("one piece")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async searchSuggestions(q) {
    return getAnimeSearchSuggestion(q);
  }
  /**
   * @param {string} animeEpisodeId - unique anime episode id
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getEpisodeServers("steinsgate-0-92?ep=2055")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getEpisodeServers(animeEpisodeId) {
    return getEpisodeServers(animeEpisodeId);
  }
  /**
   * @param {string} date - date in `YYYY-MM-DD` format
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getEstimatedSchedule("2024-08-09")
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getEstimatedSchedule(date) {
    return getEstimatedSchedule(date);
  }
  /**
   * @throws {HiAnimeError}
   * @example
   * import { HiAnime } from "aniwatch";
   *
   * const hianime = new HiAnime.Scraper()
   *
   * hianime.getHomePage()
   *  .then((data) => console.log(data))
   *  .catch((err) => console.error(err));
   *
   */
  async getHomePage() {
    return getHomePage();
  }
};
export {
  hianime_exports as HiAnime,
  HiAnimeError
};