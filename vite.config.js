import { defineConfig } from "vite";  

export default defineConfig({
    base: "./",
    build : {
        minify: "terser",//Evite bug de compil avec Kaboom
    }, 
});