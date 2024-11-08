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

## Crear un nuevo Todo (server actions)

La idea en este caso es mandar a llamar al server actions dentro de nuestro onSubmit en el componente NewTodo.jsx.

Esto es lo que vamos a reemplazar por nuestra server actions

```js
export const NewTodo = () => {
  const [description, setDescription] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (description.trim().length === 0) return;
    await todosApi.createTodo(description);
    setDescription("");
    router.refresh();
  };
};
```

Formas de trabajar la mutación de la data

- [En esta forma le deja toda la validation al backend](https://nextjs.org/learn/dashboard-app/mutating-data)

- [En esta forma utilizamos los server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

##### Implementing de clase

1. Crear el código para crear un todo: El cual es el mismo código para un POST

```js
try {
  const { complete, description } = await postSchema.validate(
    await request.json()
  );
  const todo = await prisma.todo.create({ data: { complete, description } });
  return NextResponse.json(todo);
} catch (error) {
  return NextResponse.json({ message: error }, { status: 400 });
}
```

2. En todo-actions.ts, adaptamos todo el código del punto 1, en nuestro server actions

```js
export const addTodo = async (description: string) => {
  try {
    const todo = await prisma.todo.create({ data: { description } });
    revalidatePath("/dashboard/server-todos");
    return todo;
  } catch (error) {
    return {
      message: "Error creando todo",
    };
  }
};
```

3. Lo utilizamos en el component NewTodo.tsx:

```js
const onSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (description.trim().length === 0) return;
  await addTodo(description);
  setDescription("");
  // router.refresh();
};
```

## Eliminar Todo (server actions)

1. Crear el código para un DELETE: tenemos que adaptar el código de nuestra carpeta api en nuestro server actions:

Este bloque tenemos que adaptar en nuestro todo.actions.ts

```js
try {
  const todo = await prisma.todo.deleteMany({
    where: { complete: true },
  });
  return NextResponse.json("Borrados");
} catch (error) {
  return NextResponse.json({ message: error }, { status: 400 });
}
```

2. Adaptamos en todo-actions.ts:

```js
export const deleteCompleted = async (): Promise<void> => {
  try {
    const todo = await prisma.todo.deleteMany({
      where: { complete: true },
    });
    revalidatePath("/dashboard/server-todos");
  } catch (error) {}
};
```

3. Lo utilizamos en la función del formulario para borrar los completados, directamente lo utilizamos en el onClick()

```js
import { addTodo, deleteCompleted } from "@/todos/actions/todo-actions";

<button
  onClick={() => deleteCompleted()}
  type="button"
  className="flex items-center justify-center rounded ml-2 bg-red-400 p-2 text-white hover:bg-red-700 transition-all"
>
  <IoTrashOutline />
  <span className="ml-2 text-text-sm">Borrar completados</span>
</button>;
```

> [!IMPORTANTE ]
>
> La forma de llamar a nuestro server actions tiene que ser la siguiente:
>
> onClick={() => deleteCompleted()} // ESTA FORMA LO HACEMOS PARA NO MANDAR NINGÚN ARGUMENTO.
>
> Esto se debe a que si lo enviamos de la siguiente forma onClick={deleteCompleted} nos tira un error
>
> Explicación: hay objects que no son serializable, es decir, estamos enviando un object, una instancia del evento que tiene muchos methods y propiedades, el problema no radica en esos methods o propiedades sino en que que hay clases o prototipos que no son soportados.

## useOptimistic Hook - React

Todavía nos queda aprender una técnica para mejorar la optimización visual de nuestra app, vamos a simular una demora con una function sleep() en nuestro server actions:

```js
"use server";

import prisma from "@/lib/prisma";
import { Todo } from "@prisma/client";
import { revalidatePath } from "next/cache";

// function para simular demoras en la respuesta
export const sleep = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
};

export const toggleTodo = async (
  id: string,
  complete: boolean
): Promise<Todo> => {
  // * vamos a simular una demora en la petición
  await sleep(3);
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

1. En el component TodoItem.tsx vamos a hacer una importación de React para poder utilizar el hook.

```js
import { useOptimistic } from "react";
```

2. Creamos el hook

```js
const [todoOptimistic, toggleTodoOptimistic] = useOptimistic(todo);
```

3. Ahora si queremos utilizar nuestro todo tendríamos que utilizar nuestro nuevo inicial state => todoOptimistic, en lugar de todo.

```js
"use client";
import { useOptimistic } from "react";
import { Todo } from "@prisma/client";
import styles from "./TodoItem.module.css";
import { IoCheckboxOutline, IoSquareOutline } from "react-icons/io5";

interface Props {
  todo: Todo;
  // TODO: Acciones que quiero llamar
  toggleTodo: (id: string, complete: boolean) => Promise<Todo | void>;
}

const TodoItem = ({ todo, toggleTodo }: Props) => {
  // crear el hook
  const [todoOptimistic, toggleTodoOptimistic] = useOptimistic(todo);

  return (
    <div
      className={todoOptimistic.complete ? styles.todoDone : styles.todoPending}
    >
      <div className="flex flex-col sm:flex-row justify-start items-center gap-4 ">
        <div
          onClick={() =>
            toggleTodo(todoOptimistic.id, !todoOptimistic.complete)
          }
          className={`
            flex p-2 rounded-md cursor-pointer 
            hover:bg-opacity-60 
            ${todoOptimistic.complete ? "bg-blue-100" : "bg-red-100"}
            `}
        >
          {todoOptimistic.complete ? (
            <IoCheckboxOutline size={30} />
          ) : (
            <IoSquareOutline size={30} />
          )}
        </div>
        <div className="text-center sm:text-left">
          {todoOptimistic.description}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
```

4. Para hacer el proceso que haga el cambio visual, tenemos que ver en que momento vamos a llamar nuestro `toggleTodoOptimistic`.

Como segundo argumento mandamos un callback con dos argumentos: el state y el argumento que nosotros utilicemos en este caso vamos a mandar el newCompleteValue de tipo boolean.

```js
     const [todoOptimistic, toggleTodoOptimistic] = useOptimistic(
      todo,
      (state, newCompleteValue: boolean)=>()
    );

```

Ahora tenemos que retornar un nuevo estado que seria un todo y el nuevo valor del complete. No es mas que una simple function para cambiar el todo que tenemos de valor inicial pero optimizado de manera visual:

```js
const [todoOptimistic, toggleTodoOptimistic] = useOptimistic(
  todo,
  (state, newCompleteValue: boolean) => ({
    ...state,
    complete: newCompleteValue,
  })
);
```

5. Armamos la función onToggleTodo()

```js
const onToggleTodo = async () => {
  try {
    toggleTodoOptimistic(!todoOptimistic.complete);
    await toggleTodo(todoOptimistic.id, !todoOptimistic.complete);
  } catch (error) {
    toggleTodoOptimistic(!todoOptimistic.complete);
  }
};
```

6. La utilizamos en el componente:

```js
 return (
    <div
      className={todoOptimistic.complete ? styles.todoDone : styles.todoPending}
    >
      <div className="flex flex-col sm:flex-row justify-start items-center gap-4 ">
        <div
          // onClick={() =>
          //   toggleTodo(todoOptimistic.id, !todoOptimistic.complete)
          // }
          onClick={ onToggleTodo}
          className={`
            flex p-2 rounded-md cursor-pointer
            hover:bg-opacity-60
            ${todoOptimistic.complete ? "bg-blue-100" : "bg-red-100"}
            `}
        >
          {todoOptimistic.complete ? (
            <IoCheckboxOutline size={30} />
          ) : (
            <IoSquareOutline size={30} />
          )}
        </div>
        <div className="text-center sm:text-left">
          {todoOptimistic.description}
        </div>
      </div>
    </div>
  );
};
```

7. Para solucionar el error que aparece en consola tenemos que utilizar el toggleTodoOptimistic con el startTransition(), este ultimo lo debemos importar de react:

```js
const onToggleTodo = async () => {
  try {
    startTransition(() => toggleTodoOptimistic(!todoOptimistic.complete));

    await toggleTodo(todoOptimistic.id, !todoOptimistic.complete);
  } catch (error) {
    startTransition(() => toggleTodoOptimistic(!todoOptimistic.complete));
  }
};
```

> [!NOTAS ]
>
> El hook se parece muchísimo a useState: porque tiene un estado inicial y una función o dispatch para actualizar.
> const [optimisticTodo, setOptimisticTodo] = useOptimistic(todo);
>
> En nuestro caso lo utilizamos de la siguiente forma:
> `const [todoOptimistic, toggleTodoOptimistic] = useOptimistic(todo);`

## Revalidation de la data

Si bien next maneja bastante bien el cache, el problema radica cuando tenemos data muy dinámica por ejemplo en nuestro todos que varios usuarios puedan actualizar los todos.

Para solventar esa problemática vamos a utilizar lo siguiente: [Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)

Nota: esto es lo que tenemos que utilizar en el caso de NO estar trabajando con el `fetch()`.
> [!IMPORTANTE ]
>
> Esta configuración solo funciona para PAGE, LAYOUT O ROUTE HANDLER.
>


1. De la documentación las options que nos interesan son 2 para poder crear una ruta 100% dinámica: `dynamic` y `revalidate`.

Dynamic

```js
export const dynamic = "auto";
// 'auto' | 'force-dynamic' | 'error' | 'force-static'
```

Valores:

- auto : configuración por defecto.
- force-dynamic : esta opción fuerza a que se haga una renderizan dinámica. En caso de trabajar con fetch() podemos hacer esta configuración => ` { cache: 'no-store', next: { revalidate: 0 } }`.

Revalidate

```js
export const revalidate = false;
// false | 0 | number
```

- false : configuration por defecto.
- 0 : esto asegura que siempre la pagina sea revalidada.
- number
- Infinity : configuration para que no sea revalidada nunca.

2. En la carpeta server-todos vamos a trabajar sobre la page.tsx y vamos a implementar el `dynamic` y el `revalidate`

En la page de server todos:

```js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NewTodo } from "@/components";
import prisma from "@/lib/prisma";
import TodosGrid from "@/todos/components/TodosGrid";

export const metadata = {
  title: "Server: Listado de Todos",
  description: "SEO Title",
};

export default async function ServerTodosPage() {
  const todos = await prisma.todo.findMany({
    orderBy: { description: "asc" },
  });

  return (
    <>
      <span className="text-3xl mb-10">Server Actions</span>
      <div className="w-full px-3 mx-5 mb-5">
        <NewTodo />
      </div>
      <TodosGrid todos={todos} />
    </>
  );
}
```

También vamos a implementarlo en rest-todo:

```js
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NewTodo } from "@/components";
import prisma from "@/lib/prisma";
import TodosGrid from "@/todos/components/TodosGrid";

export const metadata = {
  title: "Listado de Todos",
  description: "SEO Title",
};

export default async function RestTodosPage() {
  const todos = await prisma.todo.findMany({
    orderBy: { description: "asc" },
  });

  return (
    <div>
      <div className="w-full px-3 mx-5 mb-5">
        <NewTodo />
      </div>
      <TodosGrid todos={todos} />
    </div>
  );
}
```
