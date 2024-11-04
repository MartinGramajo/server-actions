## Server Actions - Optimistic Updates - Next 14+

El objetivo es usar características nuevas tanto de Next como React: 

Puntos que vamos a trabajar:

1. Server Actions
Esto marca un antes y después de comunicación cliente/servidor, ya que antes, ocupábamos una llamada HTTP mediante un restful API para realizar un cambio desde el cliente, ahora eso ya no es necesario.  

2. useOptimistic 
Hook de React que nos ayudara a que podamos realizar cambios en el UI aunque no tengamos las respuestas esperadas de procesos asíncronos.


# Continuación del proyecto

# Development

Pasos para levantar la app en desarrollo

1. Levantar la base de datos. Esto con el docker abierto en nuestra PC.

```
docker compose up -d
```

2. Crear una copia de el .env.template, y renombrarlo a .env
3. Reemplazar las variables de entorno.
4. Ejecutar el comando `npm install`
5. Ejecutar el comando `npm run dev`
6. Ejecutar estos comando de prisma: Estos comando los ejecutamos porque la base al estar totalmente limpia no se ejecutaron los comando de migración ni el de generación del cliente (no hay regeneración del cliente ni tenemos ese schema en sintonía con nuestra base de datos).

```
npx prisma migrate dev
npx prisma generate
```

7. Ejecutar el SEED (esto es para reconstruir la base de datos local ) para [crear la base de datos local](http://localhost:3000/api/seed)

# Prisma commands

```
npx prisma init
npx prisma migrate dev
npx prisma generate
```

# Prod

# Stage

## Continuación de la app  

- Server Actions: es una function que tiene acceso al servidor.
Para que sea un server action tenemos 2 formas: que a nivel de archivo este en primera linea 'use server' o a nivel de función hagamos lo mismo, es decir, agregar el 'use server'.

Para usarlo lo llamamos como cualquier otra function.

- Para poder utilizar los server actions y las nuevas características necesitamos estar en una version superior a Next 13, podemos actualizar los packages podemos utilizar la siguiente librería: [link para la documentación ](https://www.npmjs.com/package/npm-check-updates)

Comando: ```npm i -g npm-check-updates```
Una vez instalado tenemos que utilizar el siguiente comando ```ncu -u``` en un lugar donde tengamos el package.json. Este comando verifica las modificaciones tanto mayores como menores. 

Comando: ```ncu --upgrade```
Este comando lo que hace es actualizar o ponernos al dia con todas las modificaciones.

## Preparar pantalla de Server Actions

Creamos una nueva ruta (server-todos) para poder tener la pantalla donde vamos a trabajar las server actions utilizando la misma estructura que teníamos en la vista de rest-todos.