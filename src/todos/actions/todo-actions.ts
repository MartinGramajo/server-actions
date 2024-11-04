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

export const deleteCompleted = async (): Promise<void> => {
  try {
    const todo = await prisma.todo.deleteMany({
      where: { complete: true },
    });
    revalidatePath("/dashboard/server-todos");
  } catch (error) {}
};


export const refreshCompleted = async ()=>{
    await prisma.todo.deleteMany(); 
    await prisma.todo.createMany({
      data:[
          {description:'Piedra del alma', complete: true},
          {description:'Piedra del poder'},
          {description:'Piedra del tiempo'},  
          {description:'Piedra del espacio'},
          {description:'Piedra del realidad'}
      ]
    })

    revalidatePath("/dashboard/server-todos");
    return {
      message: "Seed Executed",
    };

}