import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {appActions, RequestStatusType} from 'app/app-reducer'
import {handleServerNetworkError} from 'utils/error-utils'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const slice = createSlice({
    name: 'todolists',
    initialState: [] as TodolistDomainType[],
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)

            if (index !== -1) {
                state.splice(index, 1)
            }
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {

            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)

            if (index !== -1) {
                state[index].title = action.payload.title
            }
        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const todolist = state.find((todo) => todo.id === action.payload.id)

            if (todolist) {
                todolist.filter = action.payload.filter
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const todolist = state.find((todo) => todo.id === action.payload.id)

            if (todolist) {
                todolist.entityStatus = action.payload.status
            }
        },
        setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
            // 1 variant
            // return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}))

            // 2 variant
            action.payload.todolists.forEach((tl) => {
                state.push({
                    ...tl, filter: "all", entityStatus: "idle"
                })
            })
        }


    }
})

export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(todolistsActions.setTodolists({todolists: res.data}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string): AppThunk => {
    return (dispatch: Dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appActions.setAppStatus({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(todolistsActions.removeTodolist({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(todolistsActions.changeTodolistTitle({id, title}))
            })
    }
}

// types


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}


export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions