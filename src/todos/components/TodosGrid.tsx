'use client'

import React from 'react'
import { Todo } from '@prisma/client';
import TodoItem from './TodoItem';


// esto es cuando tenemos muchas acciones 
// nos brinda la posibilidad de tener un código mucho mas ordenado 
// al saber de que carpeta o elemento estamos importante las funciones: api.update

import * as todosApi from "@/todos/helpers/todos"
import { useRouter } from 'next/navigation'; // asegurarse de tomar de next/navigation porque esto es lo nuevo de Next +13

interface Props {
    todos?:Todo[];
}


const TodosGrid = ({todos=[]}:Props) => {


  const router = useRouter();

  const toggleTodo = async (id: string, complete: boolean)=>{
    const updatedTodo = await todosApi.updateTodo(id, complete);
    router.refresh();
  }



  return (
    <div className='gird grid-cols-1 sm:grid-cols-3 gap-2'>
     {
        todos.map( todo => (
            <TodoItem 
            key={todo.id} 
            todo={todo} 
            toggleTodo={toggleTodo}
            />
        ))
     }
    </div>
  )
}

export default TodosGrid
