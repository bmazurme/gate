import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextInput, Button, Text, Alert, Flex } from '@gravity-ui/uikit';
import { useRegisterMutation } from '../store/api/authApi/authApi';
import { useAppDispatch } from '../hooks/hooks';
import { credentialsSet } from '../store/slices/authSlice';
import { AuthCard } from '../components/AuthCard/AuthCard';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t, Message } from './i18n';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    try {
      const { accessToken, user } = await register({
        email,
        password,
        name: name || undefined,
      }).unwrap();
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
          <Text variant="header-1">{t('register_title')}</Text>
          {error && <Alert theme="danger" message={getErrorMessage(error)} />}
          <TextInput
            type="email"
            placeholder={t('register_email_placeholder')}
            value={email}
            onUpdate={setEmail}
            size="l"
            autoComplete="email"
          />
          <TextInput
            placeholder={t('register_name_placeholder')}
            value={name}
            onUpdate={setName}
            size="l"
            autoComplete="name"
          />
          <TextInput
            type="password"
            placeholder={t('register_password_placeholder')}
            value={password}
            onUpdate={setPassword}
            size="l"
            autoComplete="new-password"
          />
          <Button view="action" size="l" type="submit" loading={isLoading} width="max">
            {t('register_submit')}
          </Button>
          <Text variant="body-1" color="secondary">
            <Message
              id="register_have_account"
              values={{ link: (chunks) => <Link to="/login">{chunks}</Link> }}
            />
          </Text>
        </Flex>
      </form>
    </AuthCard>
  );
}
