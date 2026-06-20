import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput, Button, Text, Alert, Flex } from '@gravity-ui/uikit';
import { useLoginMutation } from '../store/api/authApi/authApi';
import { useAppDispatch } from '../hooks/hooks';
import { credentialsSet } from '../store/slices/authSlice';
import { AuthCard } from '../components/AuthCard/AuthCard';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t, Message } from './i18n';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    try {
      const { accessToken, user } = await login({ email, password }).unwrap();
      dispatch(credentialsSet({ accessToken, user }));
      navigate('/', { replace: true });
    } catch {
      // ошибка отображается через `error` из хука мутации
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={4}>
          <Text variant="header-1">{t('login_title')}</Text>
          {error && <Alert theme="danger" message={getErrorMessage(error)} />}
          <TextInput
            type="email"
            placeholder={t('login_email_placeholder')}
            value={email}
            onUpdate={setEmail}
            size="l"
            autoComplete="email"
          />
          <TextInput
            type="password"
            placeholder={t('login_password_placeholder')}
            value={password}
            onUpdate={setPassword}
            size="l"
            autoComplete="current-password"
          />
          <Button view="action" size="l" type="submit" loading={isLoading} width="max">
            {t('login_submit')}
          </Button>
          <Text variant="body-1" color="secondary">
            <Message
              id="login_no_account"
              values={{ link: (chunks) => <Link to="/register">{chunks}</Link> }}
            />
          </Text>
        </Flex>
      </form>
    </AuthCard>
  );
}
