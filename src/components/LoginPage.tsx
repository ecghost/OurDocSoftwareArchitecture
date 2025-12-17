import React, {useState} from 'react';
import {Form, Input, Button, Typography, Card, message} from 'antd';
import {MailOutlined, LockOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import AuthModal from './AuthModal';
import {login} from "../services/login.ts";
import type {AxiosError} from "axios";

const {Title, Text} = Typography;

interface LoginFormValues {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [registerVisible, setRegisterVisible] = useState(false);
    const [isExisted, setIsExisted] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm<LoginFormValues>();

    // 登录逻辑
    const handleLogin = async () => {
        const values = await form.validateFields();
        setLoading(true);
        try {
            const req = {
                email: values.email,
                password: values.password,
            };
            const res = await login(req);
            console.log(res);
            message.success('登录成功');
            form.resetFields();
            navigate('../home', {
                state: {
                    userId: res.userId,
                    email: values.email,
                }
            });
        } catch (e) {
            const err = e as AxiosError<{ detail: string }>;
            if (err.response?.status === 400) {
                const detail = err.response.data.detail;
                if (detail === '用户不存在') {
                    message.error('用户不存在，请先注册');
                } else if (detail === '密码错误') {
                    message.error('密码错误，请重试');
                } else {
                    message.error('登录失败，请重试');
                }
            } else {
                message.error('登录失败，请重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5',
            }}
        >
            <Card
                style={{
                    width: 400,
                    padding: 24,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: 20,
                }}
            >
                <div style={{textAlign: 'center', marginBottom: 24}}>
                    <Title level={3}>欢迎登录</Title>
                    <Text type="secondary">请输入您的邮箱和密码</Text>
                </div>

                <Form
                    form={form}
                    name="login_form"
                    layout="vertical"
                    onFinish={handleLogin}
                >
                    {/* 邮箱 */}
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            {required: true, message: '请输入邮箱！'},
                            {type: 'email', message: '邮箱格式不正确！'},
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined/>}
                            placeholder="请输入邮箱"
                            size="large"
                        />
                    </Form.Item>

                    {/* 密码 */}
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{required: true, message: '请输入密码！'}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="请输入密码"
                            size="large"
                        />
                    </Form.Item>

                    {/* 登录按钮 */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                        >
                            登录
                        </Button>
                    </Form.Item>

                    {/* 辅助链接 */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 14,
                        }}
                    >
                        <Button
                            type="link"
                            style={{padding: 0}}
                            onClick={() => {
                                setIsExisted(true);
                                setRegisterVisible(true);
                            }}
                        >
                            忘记密码？
                        </Button>
                        <Button
                            type="link"
                            style={{padding: 0}}
                            onClick={() => {
                                setIsExisted(false);
                                setRegisterVisible(true);
                            }}
                        >
                            立即注册
                        </Button>
                    </div>
                </Form>
            </Card>

            {/* 注册弹窗 */}
            <AuthModal
                open={registerVisible}
                isExisted={isExisted}
                onClose={() => setRegisterVisible(false)}
            />


        </div>
    );
};

export default LoginPage;
