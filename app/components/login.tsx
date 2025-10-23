'use client'

import { useLoginMutation } from '@/app/store/api/auth.api'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Checkbox, Label, TextInput, Toast } from 'flowbite-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BiError } from 'react-icons/bi'
import { MdDone } from 'react-icons/md'
import * as yup from 'yup'

const schema = yup
    .object({
        username: yup.string().required('Username is required').min(4, 'Min 4 characters'),
        password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
        remember: yup.boolean().default(false),
    })
    .required()

type LoginFormValues = yup.InferType<typeof schema>

const LoginForm = () => {
    const [serverMessage, setServerMessage] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)

    const [login, { isLoading: isMutating }] = useLoginMutation()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: yupResolver(schema),
        defaultValues: { username: '', password: '', remember: false },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const onSubmit = async (values: LoginFormValues) => {
        setServerMessage(null)
        setServerError(null)

        try {
            const res = await login(values)

            if ('error' in res) {
                const errorMessage =
                    res.error && 'data' in res.error && (res.error.data as { message?: string })?.message
                        ? (res.error.data as { message?: string })?.message
                        : 'Login failed'

                setServerError(errorMessage || 'Unexpected error.')
            } else {
                const message = res.data?.message || 'Success'
                setServerMessage(message)
                window.location.href = '/dashboard'
            }
        } catch (err) {
            setServerError(String(err) || 'Unexpected Error')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 max-w-md flex-col gap-4 mt-16">
            {serverMessage && (
                <Toast className="w-full self-stretch">
                    <MdDone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div className="pl-4 text-sm font-normal">{serverMessage}</div>
                </Toast>
            )}
            {serverError && (
                <Toast className="w-full self-stretch">
                    <BiError className="h-5 w-5 text-red-600 dark:text-red-500" />
                    <div className="pl-4 text-sm font-normal">{serverError}</div>
                </Toast>
            )}

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="username">Username</Label>
                </div>
                <TextInput
                    id="username"
                    type="text"
                    placeholder="Username"
                    color={errors.username ? 'failure' : undefined}
                    {...register('username')}
                    required
                />
                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="password">Password</Label>
                </div>
                <TextInput
                    id="password"
                    type="password"
                    placeholder="Password"
                    color={errors.password ? 'failure' : undefined}
                    {...register('password')}
                    required
                />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register('remember')} />
                <Label htmlFor="remember">Remember me</Label>
            </div>

            <Button type="submit" disabled={isSubmitting || isMutating}>
                {isSubmitting || isMutating ? 'Submitting…' : 'Submit'}
            </Button>
        </form>
    )
}

export default LoginForm
