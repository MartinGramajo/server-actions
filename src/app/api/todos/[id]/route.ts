import prisma from "@/lib/prisma";
import { Todo } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import * as yup from "yup";

interface Segments {
  params: {
    id: string;
  };
}

const getTodo = async (id: string): Promise<Todo | null> => {
  // buscamos el todo por id y lo retornamos 
  const todo = await prisma.todo.findFirst({
    where: { id },
  });

  return todo;
};

export async function GET(request: Request, { params }: Segments) {

  // buscamos el todo por id
  const todo =  await getTodo(params.id)

  // si no lo encuentra, retornamos un 404
  if (!todo) {
    return NextResponse.json(
      { message: `todo con id ${params.id} no existe ` },
      { status: 404 }
    );
  }

  return NextResponse.json(todo);
}

const putSchema = yup.object({
  complete: yup.boolean().optional(),
  description: yup.string().optional(),
});

export async function PUT(request: Request, { params }: Segments) {
  // tomamos el id de los paramos
  // const { id } = params;

  // buscamos el todo por id
  const todo = await getTodo(params.id)

  // si no lo encuentra, retornamos un 404
  if (!todo) {
    return NextResponse.json(
      { message: `todo con id ${params.id} no existe ` },
      { status: 404 }
    );
  }

  try {
    // ACTUALIZAR TODO
    const { complete, description, ...rest } = await putSchema.validate(
      await request.json()
    );
    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: { complete, description },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}
