# Wallpaper Personal

Proyecto de wallpaper visual hecho con HTML, CSS y JavaScript. Muestra una composicion tipo carrusel con imagenes destacadas, una columna lateral, hora, fecha y una frase dinamica.

## Contenido

- Carrusel de imagenes ubicado en `assets/carousel/`
- Imagen lateral ubicada en `assets/vertical/`
- Particulas finas animadas sobre la imagen lateral
- Animacion/overlay en `assets/overlay/`
- Estructura principal en `index.html`
- Estilos en `styles.css`
- Logica de fecha, hora y contenido dinamico en `script.js`
- Frases aleatorias de la barra lateral en `quotes.js`

## Uso

Abre `index.html` en el navegador para ver el wallpaper.

## Personalizacion

Para cambiar las imagenes, reemplaza los archivos dentro de `assets/` conservando los nombres actuales o actualiza las rutas en `index.html` y `script.js`.

Para cambiar las frases, edita `quotes.js` usando el formato:

```js
{
  "text": "Texto de la frase",
  "author": "Autor"
}
```

Tambien puedes usar las claves en espanol:

```js
{
  "frase": "Texto de la frase",
  "autor": "Autor"
}
```
