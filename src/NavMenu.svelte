<script>
  import Menu from "./menu/index.svelte";

  // const root = [
  //   {
  //     type: "folder",
  //     svg:
  //       "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path d='M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4'/></svg>",
  //     files: [
  //       { type: "action", name: "About this Pez…" },
  //       {
  //         type: "link",
  //         name: "Resume",
  //         url: "https://github.com/pezillionaire/resume",
  //       },
  //       {
  //         type: "link",
  //         name: "Contact",
  //         url: "https://github.com/pezillionaire/resume",
  //       },
  //       { type: "action", name: "Shut'er Down" },
  //     ],
  //   },
  //   {
  //     type: "folder",
  //     name: "Themes",
  //     files: [
  //       { type: "action", name: "harmony", active: true },
  //       { type: "action", name: "creekside", active: false },
  //       { type: "action", name: "overcast", active: false },
  //       { type: "action", name: "alpenglow", active: false },
  //     ],
  //   },
  // ];

  // const PezMenu = {
  //   type: "folder",
  //   svg:
  //     "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path d='M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4'/></svg>",
  //   files: [
  //     { type: "action", name: "About this Pez…" },
  //     {
  //       type: "link",
  //       name: "Resume",
  //       url: "https://github.com/pezillionaire/resume",
  //     },
  //     {
  //       type: "link",
  //       name: "Contact",
  //       url: "https://github.com/pezillionaire/resume",
  //     },
  //     { type: "action", name: "Shut'er Down" },
  //   ],
  // };

  const ThemesMenu = {
    type: "toggle",
    name: "Themes",
    menuItems: [
      { type: "action", name: "harmony", active: true },
      { type: "action", name: "creekside", active: false },
      { type: "action", name: "overcast", active: false },
      { type: "action", name: "alpenglow", active: false },
    ],
  };

  const themes = [
    {
      name: "harmony",
      primary: "#0466c8",
      alt: "#e2e7ed",
    },
    {
      name: "alpenglow",
      primary: "#480ca8",
      alt: "#ffc8dd",
    },
    {
      name: "overcast",
      primary: "#222",
      alt: "#bfb8b9",
    },
    {
      name: "creekside",
      primary: "#006d77",
      alt: "#edf6f9",
    },
  ];
  function handleAction(event) {
    console.log(event);
  }
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
</script>

<nav class="navMenu">
  <!-- {#each root as folder} -->
  <!-- <Menu root={PezMenu} /> -->
  <!-- {/each} -->
  <Menu root={ThemesMenu} on:action={handleAction} />
</nav>
