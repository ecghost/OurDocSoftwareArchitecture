import React, {useEffect, useRef, useState} from 'react';
import {Modal, Form, Input, Button, message, Space} from 'antd';
import {LockOutlined, MailOutlined, SafetyCertificateOutlined, UserOutlined} from '@ant-design/icons';
import {getVerifyCode, resetPassword} from "../services/auth.ts";
import {register} from "../services/register.ts";
import type {AxiosResponse} from "axios";

interface AuthModalProps {
    open: boolean;
    isExisted: boolean;
    onClose: () => void;
}

interface AuthFormValues {
    email: string;
    verifyCode: string;
    password: string;
    confirmPassword: string;
    username?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({open, isExisted, onClose}) => {
    const [form] = Form.useForm<AuthFormValues>();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState<number>(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        // 清理定时器（组件卸载或 countdown 变化）
        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // 当 countdown 从 >0 变成 0 清理定时器
        if (countdown === 0 && timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [countdown]);

    const startCountdown = (seconds = 60) => {
        setCountdown(seconds);
        // 确保之前的定时器被清理
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        timerRef.current = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleGetCode = async () => {
        try {
            // 校验并获取 email 字段
            const values = await form.validateFields(['email']);
            const email = values.email as string;

            // 这里可以做一次防抖 / 禁止重复调用：如果已经在倒计时中直接 return
            if (countdown > 0) return;

            // 调用后端接口发送验证码（替换为你自己的 API）
            const res = await getVerifyCode({email});
            console.log(res);

            message.success('验证码已发送，请注意查收');
            // 成功后开始倒计时（60秒）
            startCountdown(60);
        } catch (err: any) {
            // validateFields 会在校验不通过时抛错，或者 axios 出错也会到这里
            if (err?.errorFields) {
                // 表单校验错误（例如 email 为空），AntD 已展示校验信息
                return;
            }
            console.error(err);
            message.error('发送验证码失败，请稍后再试');
        }
    };

    // 表单提交逻辑
    //根据isExisted决定是注册还是找回密码
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let res: AxiosResponse | undefined;
            if (isExisted) {
                const req = {
                    verifyCode: values.verifyCode,
                    email: values.email,
                    newPassword: values.password
                }
                res = await resetPassword(req)
            }
            else{
                const req:any = {
                    email: values.email,
                    password: values.password,
                    username: values.username,
                    verifyCode: values.verifyCode
                }
                res = await register(req)
            }
            console.log(res);
            message.success(isExisted ? '重置密码成功' : '注册成功');
            form.resetFields();
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setCountdown(0)
            onClose();
        } catch (e) {
            console.error(e);
            message.error('提交失败，请检查输入');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={isExisted ? "找回密码" : "注册账号"}
            onCancel={() => {
                form.resetFields();
                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setCountdown(0)
                onClose();
            }}
            footer={null}
            centered
            styles={{
                header: {
                    textAlign: 'center', // 标题文本居中
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="register_form"
                onFinish={handleSubmit}
            >
                {/* 邮箱输入框 */}
                <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                        {required: true, message: '请输入邮箱地址！'},
                        {type: 'email', message: '邮箱格式不正确！'},
                    ]}
                    hasFeedback
                >
                    <Input prefix={<MailOutlined/>} placeholder="请输入邮箱"/>
                </Form.Item>

                {/* 条件渲染用户名输入框 - 只在注册时显示 */}
                {!isExisted && (
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                            {required: true, message: '请输入用户名！'},
                            {min: 2, message: '用户名至少2个字符！'},
                            {max: 20, message: '用户名不能超过20个字符！'},
                            {
                                pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
                                message: '用户名只能包含中文、英文、数字和下划线！',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input prefix={< UserOutlined/>} placeholder="请输入用户名"/>
                    </Form.Item>
                )}

                {/* 验证码输入框 */}
                <Form.Item
                    name="verifyCode"
                    label="验证码"
                    rules={[
                        {required: true, message: '请输入验证码！'},
                    ]}
                    hasFeedback
                >
                    <Space.Compact style={{width: '100%'}}>
                        <Input
                            prefix={<SafetyCertificateOutlined/>}
                            placeholder="请输入验证码"
                        />
                        <Button
                            type='primary'
                            size="middle"
                            onClick={handleGetCode}
                            disabled={countdown > 0}
                        >
                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                    </Space.Compact>
                </Form.Item>

                {/* 密码输入框 */}
                <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                        {required: true, message: '请输入密码！'},
                        {min: 6, message: '密码至少为 6 位字符！'},
                    ]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined/>} placeholder="请输入密码"/>
                </Form.Item>

                {/* 确认密码输入框 */}
                <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {required: true, message: '请再次输入密码！'},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致！'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined/>} placeholder="请再次输入密码"/>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{marginTop: 12}}
                    >
                        {isExisted ? "找回密码" : "注册"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AuthModal;
