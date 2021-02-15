<script>
  import { onMount } from "svelte";

  let menuThemeOpen = false;
  let menuLogoOpen = false;
  let activeTheme = 0;
  const themes = [
    {
      name: "harmony",
      active: true,
      primary: "#0466c8",
      alt: "#e2e7ed",
    },
    {
      name: "alpinglow",
      active: false,
      primary: "#480ca8",
      alt: "#ffc8dd",
    },
    {
      name: "overcast",
      active: false,
      primary: "#222",
      alt: "#bfb8b9",
    },
    {
      name: "creekside",
      active: false,
      primary: "#006d77",
      alt: "#edf6f9",
    },
  ];
  let menus = [
    {
      logo: {
        name: "Logo",
        active: false,
        items: [
          {
            name: "About this Pez…",
            active: false,
          },
        ],
      },
      logo: {
        name: "Theme",
        active: false,
        items: [
          {
            name: "harmony",
            active: true,
            primary: "#0466c8",
            alt: "#e2e7ed",
          },
          {
            name: "alpinglow",
            active: false,
            primary: "#480ca8",
            alt: "#ffc8dd",
          },
          {
            name: "overcast",
            active: false,
            primary: "#222",
            alt: "#bfb8b9",
          },
          {
            name: "creekside",
            active: false,
            primary: "#006d77",
            alt: "#edf6f9",
          },
        ],
      },
    },
  ];

  const openMenu = (menu) => {
    menu = !menu;
  };

  const setTheme = (i) => {
    const root = document.querySelector(":root");
    themes[activeTheme].active = false;
    themes[i].active = true;
    activeTheme = i;
    localStorage.clear();
    localStorage.setItem("theme", JSON.stringify(themes[i]));
    root.style.setProperty("--primary", themes[i].primary);
    root.style.setProperty("--alt", themes[i].alt);
    setTimeout(() => {
      menuThemeOpen = false;
    }, 300);
  };

  const getTheme = () => {
    if (localStorage.getItem("theme") == "") {
      return themes[0];
    } else {
      const theme = localStorage.getItem("theme");
      return JSON.parse(theme);
    }
  };

  onMount(async () => {
    const theme = await getTheme();
    const themeByName = (i) => i.name === theme.name;
    setTheme(themes.findIndex(themeByName));
  });
</script>

<!-- ------- HTML template ------- -->

<span class="dropdown" id="logo">
  <button
    type="button"
    class="logo"
    class:active={menuLogoOpen}
    on:click={() => (menuLogoOpen = !menuLogoOpen)}
  >
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4"
      />
    </svg>
  </button>
  {#if menuLogoOpen}
    <ul role="menu">
      <li class:open={menuLogoOpen} class="border">
        <button
          type="button"
          on:click|once={() => (menuLogoOpen = !menuLogoOpen)}
        >
          <span>About this Pez…</span>
        </button>
      </li>
      <li><a href="https://github.com/pezillionaire/resume">Resume</a></li>
      <li>
        <a
          href="mailto:&#104;&#101;&#108;&#108;&#111;&commat;&#112;&#101;&#122;&#105;&#108;&#108;&#105;&#111;&#110;&#97;&#105;&#114;&#101;&period;&#99;&#111;&#109;?subject=Hi Pez!"
          ><span>Contact</span>
          <span class="menuitem-icon">⋮</span>
        </a>
      </li>
    </ul>
  {/if}
</span>

<span class="dropdown" id="theme">
  <button
    type="button"
    class:active={menuThemeOpen}
    on:click={() => (menuThemeOpen = !menuThemeOpen)}>Theme</button
  >
  {#if menuThemeOpen}
    <ul role="menu">
      {#each themes as { name, active }, theme}
        <li>
          <button type="button" on:click|once={() => setTheme(theme)}>
            <span>{name}</span>
            <span class="menuitem-icon">{active ? "✓" : ""}</span>
          </button>
        </li>
      {/each}
    </ul>
    <div class="bg" on:click|once={() => (menuThemeOpen = !menuThemeOpen)} />
  {/if}
</span>

<!-- ------- Style ------- -->
<style>
  .dropdown {
    display: flex;
  }
  ul {
    z-index: 101;
    list-style: none;
    position: absolute;
    top: 2.375rem;
    background-color: var(--alt);
    border: 2px solid var(--primary);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    box-shadow: 1px 1px 0 0 var(--primary);
  }
  ul li {
    width: 100%;
  }
  ul li.border {
    border-bottom: 1px solid var(--primary);
  }
  ul button,
  ul a {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    text-transform: capitalize;
    white-space: pre;
    line-height: 1.25;
  }
  ul button span,
  ul a span {
    display: inline;
  }
  .menuitem-icon {
    min-width: 1rem;
    margin-left: 2rem;
  }

  .bg {
    z-index: 100;
    content: "";
    position: fixed;
    top: 2.5rem;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
  }
</style>
