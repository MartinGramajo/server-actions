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
