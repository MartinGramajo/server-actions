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

Comando: `npm i -g npm-check-updates`
Una vez instalado tenemos que utilizar el siguiente comando `ncu -u` en un lugar donde tengamos el package.json. Este comando verifica las modificaciones tanto mayores como menores.

Comando: `ncu --upgrade`
Este comando lo que hace es actualizar o ponernos al dia con todas las modificaciones.

## Preparar pantalla de Server Actions

Creamos una nueva ruta (server-todos) para poder tener la pantalla donde vamos a trabajar las server actions utilizando la misma estructura que teníamos en la vista de rest-todos.

## Server Actions Toggle Todo

La idea es que en lugar de crear un Restful API, lo queremos hacer mediante server actions.

1. En nuestra carpeta TODOS, vamos a crear una sub-carpeta ACTIONS con el archivo actions.ts o todo-actions.ts.

2. En el archivo `todo-actions.ts` vamos a crear una función que haga todo el trabajo del toggle todo.

```js
"use server";

import prisma from "@/lib/prisma";
import { Todo } from "@prisma/client";

export const toggleTodo = async (
  id: string,
  complete: boolean
): Promise<Todo> => {
  // 1. Buscamos el todo
  const todo = await prisma.todo.findFirst({
    where: {
      id,
    },
  });

  // 2. Verificamos que el todo exista
  if (!todo) {
    throw `Todo con id ${id} no encontrado`;
  }

  // 3. Actualizamos el todo
  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { complete },
  });

  return updatedTodo;
};
```

NOTA: Para que sea un server action tenemos 2 formas: que a nivel de archivo este en primera linea 'use server' y todo el contenido sea ejecutado del lado del servidor pero que pueda ser llamado por el cliente o a nivel de función hacemos lo mismo, es decir, agregar el 'use server' en la primera linea entre llaves de nuestra function:

Ejemplo en primera linea:

```js
"use server";
export const toggleTodo = async (id: string, complete: boolean) => {};
```

Ejemplo en function:

```js
export const toggleTodo = async (id: string, complete: boolean) => {
  "use server";
};
```

3. Ahora lo vamos a utilizar en el component TodosGrid.tsx

```js
import { toggleTodo } from "../actions/todo-actions";

interface Props {
  todos?: Todo[];
}

const TodosGrid = ({ todos = [] }: Props) => {
  const router = useRouter();
  // const toggleTodo = async (id: string, complete: boolean)=>{
  //   const updatedTodo = await todosApi.updateTodo(id, complete);
  //   router.refresh();
  // }
  return (
    <div className="gird grid-cols-1 sm:grid-cols-3 gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} toggleTodo={toggleTodo} />
      ))}
    </div>
  );
};

export default TodosGrid;
```

NOTA: lo podemos llamar directamente desde nuestra carpeta de todo-actions.ts para utilizarlo.

4. Actualizar en pantalla: Si bien nuestro server-actions cumple su funcionamiento,es decir, hace el toggle pero para poder ver los cambios impactados en la UI tenemos que actualizar el navegador, cosa que no queremos para estropear la exp de usuario. Y lo tenemos que actualizar manualmente xq ya no estamos utilizando el useRouter() con el method refresh().

Por esta razón vamos agregar una linea adicional en nuestro server actions para que haga la actualización de la pantalla en forma automática al cambio.

Agregamos el `revalidatePath('ruta')` y lo importamos de next/cache. Lo que hace es actualizar los cambios que operaron en esa ruta algo similar al router.refresh() pero esto lo realiza directamente del servidor, manteniendo los cambio en cache y next ya se encarga de hacer el trabajo por nosotros.

```js
"use server";

import prisma from "@/lib/prisma";
import { Todo } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const toggleTodo = async (
  id: string,
  complete: boolean
): Promise<Todo> => {
  // 1. Buscamos el todo
  const todo = await prisma.todo.findFirst({
    where: {
      id,
    },
  });

  // 2. Verificamos que el todo exista
  if (!todo) {
    throw `Todo con id ${id} no encontrado`;
  }

  // 3. Actualizamos el todo
  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { complete },
  });

  // 4. Revalidate por el path para actualizar unicamente lo que  cambio

  revalidatePath("/dashboard/server-todos");

  return updatedTodo;
};
```
