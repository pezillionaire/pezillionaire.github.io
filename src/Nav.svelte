<button type="button" class="logo">
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4"
    />
  </svg>
</button>
<a href="https://github.com/pezillionaire/resume">Resume</a>
<a
  href="mailto:&#104;&#101;&#108;&#108;&#111;&commat;&#112;&#101;&#122;&#105;&#108;&#108;&#105;&#111;&#110;&#97;&#105;&#114;&#101;&period;&#99;&#111;&#109;?subject=Hi Pez!"
  >Contact</a
>
<span class="dropdown">
  <button
    type="button"
    class:active={menuThemeOpen}
    on:click={() => (menuThemeOpen = true)}>Theme</button
  >
  {#if menuThemeOpen}
    <ul role="menu">
      {#each themes as { name, active }, theme}
        <li>
          <button type="button" on:mousedown|once={() => setTheme(theme)}>
            <span>{name}</span>
            <span class="menu-check">{active ? '✓' : ''}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</span>

<svelte:window on:mousedown={() => (menuThemeOpen = false)} />

<script>
  import { onMount } from 'svelte';
  let menuThemeOpen = false;
  let activeTheme = 0;
  const themes = [
    {
      name: 'harmony',
      active: true,
      primary: '#0466c8',
      alt: '#e2e7ed',
    },
    {
      name: 'alpinglow',
      active: false,
      primary: '#480ca8',
      alt: '#ffc8dd',
    },
    {
      name: 'overcast',
      active: false,
      primary: '#222',
      alt: '#bfb8b9',
    },
    {
      name: 'creekside',
      active: false,
      primary: '#006d77',
      alt: '#edf6f9',
    },
  ];

  const setTheme = (i) => {
    const root = document.querySelector(':root');
    themes[activeTheme].active = false;
    themes[i].active = true;
    activeTheme = i;
    localStorage.clear();
    localStorage.setItem('theme', JSON.stringify(themes[i]));
    root.style.setProperty('--primary', themes[i].primary);
    root.style.setProperty('--alt', themes[i].alt);
    menuThemeOpen = false;
  };
  const getTheme = () => {
    if (localStorage.getItem('theme') == '') {
      return themes[0];
    } else {
      const theme = localStorage.getItem('theme');
      return JSON.parse(theme);
    }
  };
  onMount(async () => {
    const theme = await getTheme();
    const themeByName = (i) => i.name === theme.name;
    setTheme(themes.findIndex(themeByName));
  });
</script>

<style>
  .dropdown {
    display: flex;
  }
  ul {
    z-index: 100;
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
  ul button {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.875rem;
    text-transform: capitalize;
  }
  .menu-check {
    min-width: 1rem;
    margin-left: 2rem;
  }
</style>
