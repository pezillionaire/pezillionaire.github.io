<header role="banner">
  <nav><Nav /></nav>
  <div id="clock"><Clock /></div>
</header>
<main role="main">
  <section class="window-layer">
    {#if windowMac}
      <Window title="Pez Disk" on:close={() => (windowMac = false)}>
        <h1>Pezillionaire Interactive Mfg. Concern</h1>
        <p />
      </Window>
    {/if}
    {#if windowTrash}
      <Window title="Garbage" on:close={() => (windowTrash = false)}>
        <div class="socials">
          <a
            href="https://twitter.com/pezillionaire"
            class="icon"
            target="blank"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path
                class="svg-prime"
                d="M2 .4h28m-29 1h30m-31 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h7m1 0h10m4 0h4m1 0h5m-32 1h7m2 0h8m6 0h1m2 0h6m-32 1h7m3 0h6m12 0h4m-32 1h7m5 0h4m10 0h6m-32 1h7m8 0h1m9 0h7m-32 1h8m17 0h7m-32 1h9m16 0h7m-32 1h8m17 0h7m-32 1h9m15 0h8m-32 1h10m14 0h8m-32 1h9m14 0h9m-32 1h10m13 0h9m-32 1h11m11 0h10m-32 1h12m9 0h11m-32 1h11m9 0h12m-32 1h8m10 0h14m-32 1h10m6 0h16m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-31 1h30m-29 1h28"
              />
              <path
                class="svg-alt"
                d="M7 8.4h1m10 0h4m4 0h1m-20 1h2m8 0h6m1 0h2m-19 1h3m6 0h12m-21 1h5m4 0h10m-19 1h8m1 0h9m-17 1h17m-16 1h16m-17 1h17m-16 1h15m-14 1h14m-15 1h14m-13 1h13m-12 1h11m-10 1h9m-10 1h9m-12 1h10m-8 1h6"
              />
            </svg>
            <span>Rants</span>
          </a>
          <a
            href="https://github.com/pezillionaire"
            class="icon"
            target="blank"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path
                class="svg-prime"
                d="M12 .444h8m-11 1h14m-16 1h18m-19 1h20m-21 1h22m-23 1h24m-25 1h4m1 0h16m1 0h4m-27 1h5m3 0h12m3 0h5m-28 1h5m18 0h5m-29 1h6m18 0h6m-30 1h6m18 0h6m-30 1h6m18 0h6m-31 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h7m18 0h7m-31 1h7m16 0h7m-30 1h8m14 0h8m-30 1h4m1 0h5m10 0h10m-29 1h3m2 0h6m6 0h11m-27 1h3m2 0h5m6 0h10m-26 1h4m12 0h10m-25 1h4m11 0h9m-23 1h8m6 0h8m-21 1h7m6 0h7m-18 1h5m6 0h5m-14 1h3m6 0h3m-10 1h1m6 0h1"
              />
              <path
                class="svg-alt"
                d="M7 6.444h1m16 0h1m-18 1h3m12 0h3m-18 1h18m-18 1h18m-18 1h18m-18 1h18m-19 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-19 1h18m-17 1h16m-15 1h14m-18 1h1m5 0h10m-16 1h2m6 0h6m-13 1h2m5 0h6m-12 1h12m-11 1h11m-6 1h6m-6 1h6m-6 1h6m-6 1h6m-6 1h6"
              />
            </svg>
            <span>Codes</span>
          </a>
          <a href="https://twitch.tv/pezillionaire" class="icon" target="blank">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path
                class="svg-prime"
                d="M3 .533h29m-29 1h29m-30 1h30m-30 1h4m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m22 0h4m-31 1h5m21 0h4m-30 1h5m20 0h4m-29 1h5m19 0h4m-28 1h11m4 0h12m-27 1h11m3 0h12m-26 1h11m2 0h12m-25 1h11m1 0h12m-24 1h23m-15 1h8m-8 1h6m-6 1h6m-6 1h5"
              />
              <path
                class="svg-alt"
                d="M6 3.533h23m-23 1h23m-23 1h23m-23 1h23m-23 1h23m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h23m-23 1h23m-23 1h22m-22 1h21m-21 1h20m-20 1h19m-13 1h4m-4 1h3m-3 1h2m-2 1h1"
              />
            </svg>
            <span>Games</span>
          </a>
        </div>
      </Window>
    {/if}
  </section>
  <section class="icon-layer">
    <button
      type="button"
      class="icon mac"
      class:open={windowMac}
      on:click={() => (windowMac = true)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path class="svg-prime-fill" d="M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z" />
        <path
          class="svg-alt-fill"
          d="M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z"
        />
        <path
          class="svg-prime-fill"
          d="M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z"
        />
        <path
          class="svg-alt-fill"
          d="M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z"
        />
      </svg>
      <!-- <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path class="svg-prime" d="M10 2.455h44m-44 1h44m-46 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m6 0h32m6 0h2m-48 1h2m6 0h32m6 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m8 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m8 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m16 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m16 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m20 0h2m4 0h2m-48 1h2m4 0h2m2 0h2m2 0h2m2 0h2m20 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m4 0h2m32 0h2m4 0h2m-48 1h2m6 0h32m6 0h2m-48 1h2m6 0h32m6 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m22 0h16m6 0h2m-48 1h2m22 0h16m6 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-48 1h2m44 0h2m-46 1h46m-46 1h46m-46 1h2m40 0h2m-44 1h2m40 0h2m-44 1h2m40 0h2m-44 1h2m40 0h2m-44 1h2m40 0h2m-44 1h2m40 0h2m-44 1h44m-44 1h44"/>
        <path class="svg-alt" d="M10 4.455h44m-44 1h44m-44 1h44m-44 1h44m-44 1h6m32 0h6m-44 1h6m32 0h6m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h8m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h8m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h16m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h16m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h24m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h24m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h24m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h24m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h20m2 0h4m-44 1h4m2 0h2m2 0h2m2 0h2m2 0h20m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h4m2 0h32m2 0h4m-44 1h6m32 0h6m-44 1h6m32 0h6m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h22m16 0h6m-44 1h22m16 0h6m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-44 1h44m-42 3h40m-40 1h40m-40 1h40m-40 1h40m-40 1h40m-40 1h40"/>
      </svg> -->
      <span>Pez Disk</span>
    </button>
    <button
      type="button"
      class="icon trash"
      class:open={windowTrash}
      on:click={() => (windowTrash = true)}
    >
      <!-- <svg viewbox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path class="svg-prime" d="M26 .5h12m-12 1h12m-14 1h2m12 0h2m-16 1h2m12 0h2m-28 1h40m-40 1h40m-42 1h2m40 0h2m-44 1h2m40 0h2m-44 1h44m-44 1h44m-42 1h2m36 0h2m-40 1h2m36 0h2m-40 1h2m36 0h2m-40 1h2m36 0h2m-40 1h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2m-40 1h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2m-40 1h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2m-40 1h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2m-40 1h2m36 0h2m-40 1h2m36 0h2m-40 1h2m36 0h2m-40 1h2m36 0h2m-38 1h36m-36 1h36"/>
        <path class="svg-alt" d="M26 2.5h12m-12 1h12m-26 3h40m-40 1h40m-38 3h36m-36 1h36m-36 1h36m-36 1h36m-36 1h4m2 0h6m2 0h6m2 0h6m2 0h6m-36 1h4m2 0h6m2 0h6m2 0h6m2 0h6m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h6m2 0h6m2 0h6m2 0h6m2 0h4m-36 1h4m2 0h6m2 0h6m2 0h6m2 0h6m-36 1h4m2 0h6m2 0h6m2 0h6m2 0h6m-36 1h36m-36 1h36m-36 1h36m-36 1h36"/>
      </svg> -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path
          class="svg-alt-fill"
          d="M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z"
        />
        <path
          class="svg-prime-fill"
          d="M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z"
        />
      </svg>
      <span>Garbage</span>
    </button>
  </section>
</main>

<script>
  import Nav from './Nav.svelte';
  import Clock from './Clock.svelte';
  import Window from './Window.svelte';

  let windowMac = true;
  let windowTrash = false;
</script>
