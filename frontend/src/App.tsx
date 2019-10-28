import { faFileArchive } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Spinner } from 'react-rainbow-components';
import './App.css';
import logo from './logo.svg';

const bcrypt = require('bcryptjs');

const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:64031'
    : 'http://gcomte.ddns.net';

type File = { id: string; name: string; title: string };

const validatePwd = async (
  file: File,
  password: string,
  success: () => void
) => {
  const hash = await bcrypt.hash(password, 10);
  const res = await fetch(`${API_URL}/file?id=${file.id}&pwdHash=${hash}`);
  if (res.ok) {
    const link = document.createElement('a');
    link.href = `${API_URL}/file?id=${file.id}&pwdHash=${hash}`;
    link.setAttribute('download', `${file.name}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode!.removeChild(link);
    success();
  } else {
    const { reason } = await res.json();
    alert(reason);
  }
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [files, setFiles] = useState([] as File[]);
  useEffect(() => {
    fetch(`${API_URL}/files`)
      .then(res => res.json())
      .then(files => setFiles(files))
      .catch(err => setErrorMessage(err))
      .finally(() => setLoading(false));
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>
          Download your files here{' '}
          <span role='img' aria-label='wink emoji'>
            😉
          </span>
        </p>
      </header>
      {loading && <Spinner size='large' />}
      {errorMessage && (
        <p>{`Impossible to get the files from server. Error : ${errorMessage}`}</p>
      )}
      {!loading && !errorMessage && (
        <div className='App-content'>
          {files.map((f: any) => (
            <Card
              key={f.id}
              title={f.title}
              icon={
                <FontAwesomeIcon
                  icon={faFileArchive}
                  size='lg'
                  className='rainbow-color_success'
                />
              }
              actions={
                <Button
                  label='Download'
                  variant='success'
                  onClick={() => {
                    setSelectedFileId(f.id);
                    setIsOpen(true);
                  }}
                />
              }
              style={{ margin: '10px 10px 0 10px' }}
            />
          ))}
        </div>
      )}
      <Modal id='modal' isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <Input
          label={`Enter password for file '${
            selectedFileId === ''
              ? 'NO_SELECTION'
              : files.find(f => f.id === selectedFileId)!.title
          }'`}
          placeholder='Password'
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '5px'
          }}
        >
          <Button
            label='Download'
            variant='success'
            disabled={password === ''}
            onClick={() => {
              validatePwd(
                files.find(f => f.id === selectedFileId)!,
                password,
                () => {
                  setIsOpen(false);
                  setPassword('');
                  setSelectedFileId('');
                }
              );
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default App;
