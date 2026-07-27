import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Upload, 
  Button, 
  Table, 
  Space, 
  Typography, 
  Input, 
  message,
  Popconfirm,
  Card,
  Modal,
  Form,
  Progress
} from 'antd';
import { 
  EditOutlined,
  UploadOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  FileOutlined,
  FormOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { fetchFiles, uploadFile, deleteFile, downloadFile, updateFileComment, updateFileName } from '../store/slices/filesSlice';
import ShareButton from './ShareButton';
import { formatDate, formatStorage } from '../api/utils';
import '../css/files.css';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50Мб в байтах

const FilesManager = () => {
  const dispatch = useDispatch();
  const { files = [], status } = useSelector(state => state.files);
  const [ searchText, setSearchText ] = useState('');
  const [ uploadModalVisible, setUploadModalVisible ] = useState(false);
  const [ comment, setComment ] = useState('');
  const [ currentFile, setCurrentFile ] = useState(null);
  const [ editNameModalVisible, setEditNameModalVisible ] = useState(false);
  const [ editCommentModalVisible, setEditCommentModalVisible ] = useState(false);
  const [ editingFile, setEditingFile ] = useState(null);
  const [ editComment, setEditComment ] = useState('');
  const [ editFileName, setEditFileName ] = useState(null);
  const [ uploading, setUploading ] = useState(false);
  const [ uploadProgress, setUploadProgress ] = useState(0);
  const textareaRef = useRef(null);
  const [ downloadProgress, setDownloadProgress ] = useState(0);
  const [ isDownloading, setIsDownloading ] = useState(false);
  const [ downloadingFile, setDownloadingFile ] = useState(null);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [ dispatch ]);

  const handleUpload = async () => {
    if (!currentFile) {
      message.warning('Пожалуйста, выберите файл');
      return;
    };

    // Проверка размера файла
    if (currentFile.size > MAX_FILE_SIZE) {
      message.error(
        `Файл слишком большой. Максимальный размер: ${formatStorage(MAX_FILE_SIZE)}. 
        Ваш файл: ${formatStorage(currentFile.size)}`
      );
      return;
    };

    try {
      setUploading(true);
      setUploadProgress(0);
      
      await dispatch(uploadFile({ 
        file: currentFile, 
        comment,
        onProgress: (progress) => setUploadProgress(progress)
      })).unwrap();
      
      message.success(`${currentFile.name} успешно загружен (${formatStorage(currentFile.size)})`);
      setUploadModalVisible(false);
      setComment('');
      setCurrentFile(null);
      setUploadProgress(0);
      dispatch(fetchFiles());
    } catch (error) {
      let errorMessage = 'Ошибка при загрузке';
      
      if (error.message.includes('413')) {
        errorMessage = 'Сервер отклонил файл как слишком большой';
      } else if (error.message.includes('network')) {
        errorMessage = 'Проблемы с соединением. Проверьте подключение к сети';
      } else if (error.message) {
        errorMessage = error.message;
      };
      
      message.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    };
  };

  const handleFileChange = (info) => {
    if (info.file.status === 'removed') {
      setCurrentFile(null);
      return;
    };

    setCurrentFile(info.file.originFileObj || info.file);
  };

  const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap();
      message.success('Файл удален');
      dispatch(fetchFiles());
    } catch (error) {
      message.error('Ошибка при удалении файла', error);
    };
  };

const handleDownload = async (fileId) => {
  try {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setDownloadingFile(file);
    setIsDownloading(true);
    setDownloadProgress(0);

    await dispatch(downloadFile({
      fileId,
      onProgress: (progress) => {
        setDownloadProgress(progress);
      }
    })).unwrap();

    // Задержка перед закрытием модалки
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadingFile(null);
    }, 1000);

    message.success('Файл скачан успешно');
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    message.error('Ошибка при скачивании файла');
    setIsDownloading(false);
    setDownloadingFile(null);
  };
};

  const handleEditComment = async () => {
    if (!editingFile) return;

    try {
      await dispatch(updateFileComment({ 
        fileId: editingFile.id, 
        comment: editComment 
      })).unwrap();

      message.success('Комментарий обновлен');
      setEditCommentModalVisible(false);
      dispatch(fetchFiles());
    } catch (error) {
      message.error(error.message || 'Ошибка при обновлении комментария');
    };
  };

  const handleEditFileName = async () => {
    if (!editingFile) return;

    try {
      await dispatch(updateFileName({ 
        fileId: editingFile.id, 
        filename: editFileName 
      })).unwrap();
      
      message.success('Имя файла изменено');
      setEditNameModalVisible(false);
      dispatch(fetchFiles());
    } catch (error) {
      message.error(error.message || 'Ошибка при изменении имени файла');
    };
  };

  const filteredFiles = files.filter(file => {
    if (!file || !file.original_name) return false;
    return file.original_name.toLowerCase().includes(searchText.toLowerCase());
  });

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleFileChange,
    fileList: currentFile ? [{
      uid: currentFile.uid || '-1',
      name: currentFile.name,
      status: 'done'
    }] : [],
    multiple: false,
    maxCount: 1
  };

  const columns = [
    {
      title: 'Имя файла',
      dataIndex: 'original_name',
      key: 'original_name',
      width: '55%',
      render: (text, record) => (
        <div>
            <Space>
                <FileOutlined style={{ color: '#52c41a' }} />
                <a onClick={() => handleDownload(record.id)}>{text}</a>
            </Space>
            <div>
                <Space>
                    <FormOutlined
                        onClick={() => {
                          setEditingFile(record);
                          setEditComment(record.comment || '');
                          setEditCommentModalVisible(true);
                        }}
                        style={{ 
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: record.comment ? '#3b7fec' : '#52c41a',
                          marginTop: '4px'
                        }}
                    />
                    Комментарий: { record.comment || 'добавить комментарий' }
                </Space>
            </div>
        </div>
      ),
      sorter: (a, b) => (a.original_name || '').localeCompare(b.original_name || '')
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      width: '15%',
      render: size => (
        <Text type="secondary">
            { formatStorage(size) }
        </Text>
      ),
      sorter: (a, b) => (a.size || 0) - (b.size || 0)
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'upload_date',
      key: 'upload_date',
      width: '15%',
      render: date => formatDate(date),
      sorter: (a, b) => new Date(a.upload_date || 0) - new Date(b.upload_date || 0)
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '15%',
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space size="middle">
                <Button 
                    icon={ <EditOutlined /> } 
                    onClick={() => {
                      setEditingFile(record);
                      setEditFileName(record.comment || '');
                      setEditNameModalVisible(true);
                    }}
                    title="Редактирование имени файла"
                />
                <Button 
                    icon={ <FormOutlined /> } 
                    onClick={() => {
                      setEditingFile(record);
                      setEditComment(record.comment || '');
                      setEditCommentModalVisible(true);
                    }}
                    title="Редактирование комментария для файла"
                />
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={() => handleDownload(record.id)}
                  title="Скачать"
                />
                <ShareButton 
                  fileId={ record.id } 
                  apiUrl="/files"
                />
                <Popconfirm
                    title="Вы уверены, что хотите удалить этот файл?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Да"
                    cancelText="Нет"
                >
                    <Button 
                        danger 
                        icon={ <DeleteOutlined /> } 
                        title="Удалить"
                    />
                </Popconfirm>
            </Space>
        </div>
      )
    }
  ];

  return (
    <div className="files-page">
        <Title level={3}>Мои файлы</Title>

        <Card className="files-actions">
            <Space size="large">
                <Button 
                    type="primary" 
                    icon={ <UploadOutlined /> }
                    onClick={() => setUploadModalVisible(true)}
                    loading={ status === 'loading' || status === 'uploading' }
                >
                    Загрузить файл
                </Button>

                <Input
                    placeholder="Поиск файлов..."
                    name="search"
                    prefix={ <SearchOutlined /> }
                    value={ searchText }
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </Space>
        </Card>

        <Table
            columns={ columns }
            dataSource={ filteredFiles }
            rowKey="id"
            loading={ status === 'loading' }
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Нет загруженных файлов' }}
            style={{ width: '100%' }}
        />

        {/* Модальное окно загрузки файла */}
        <Modal
            title="Загрузка файла"
            open={ uploadModalVisible }
            onOk={ handleUpload }
            onCancel={() => {
              setUploadModalVisible(false);
              setCurrentFile(null);
              setComment('');
              setUploadProgress(0);
            }}
            okText="Загрузить"
            cancelText="Отмена"
            confirmLoading={ status === 'uploading' }
            afterClose={() => dispatch(fetchFiles())}
        >
            <Form layout="vertical">
                <Form.Item label="Файл" required>
                    <Dragger { ...uploadProps }>
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Кликните или перетащите файл для загрузки
                        </p>
                        <p className="ant-upload-hint">
                            Поддерживаются файлы не более 50Мб
                        </p>
                    </Dragger>
                </Form.Item>

                {/* Добавляем индикатор прогресса */}
                {uploading && (
                    <Form.Item>
                        <Progress
                            percent={ uploadProgress }
                            status={ uploadProgress === 100 ? 'success' : 'active' }
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                        />
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                            { uploadProgress === 100 ? 'Файл загружен!' : 'Идет загрузка...' }
                        </div>
                    </Form.Item>
                )}

                <Form.Item label="Комментарий">
                    <TextArea 
                        rows={4} 
                        value={ comment }
                        onChange={e => setComment(e.target.value)}
                        placeholder="Введите комментарий к файлу"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>

        {/*Модальное окно скачивания файла */}
        <Modal
            title={ `Скачивание: ${ downloadingFile?.original_name || '' }` }
            open={ isDownloading }
            footer={ null }
            closable={ false }
            maskClosable={ false }
            width={300}
            centered
        >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Progress
                    percent={ downloadProgress }
                    status={ downloadProgress === 100 ? 'success' : 'active' }
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                />
            </div>
        </Modal>

        {/* Модальное окно редактирования имени файла */}
        <Modal
            title={
              <div className="modal-custom-filename-title">
                  Редактирование имени файла<br />
                  <span className="filename">{ editingFile?.original_name || '' }</span>
              </div>
            }
            open={ editNameModalVisible }
            onOk={ handleEditFileName }
            onCancel={() => setEditNameModalVisible(false)}
            afterOpenChange={(opened) => {
              if (opened && textareaRef.current) {
                setTimeout(() => {
                  textareaRef.current.focus();
                }, 50);
              };
            }}
            okText="Сохранить"
            cancelText="Отмена"
        >
            <Form layout="vertical">
                <Form.Item
                    name="filename"
                    rules={[
                      { required: true, message: 'Введите имя файла' },
                      {
                        // eslint-disable-next-line no-useless-escape
                        pattern: /^[^\\/:\*\?"<>\|]+$/, // символы кроме ^\/:*?"<>|
                        // eslint-disable-next-line no-useless-escape
                        message: 'Имя файла: 1-255 символов, кроме ^\/:*?"<>|'
                      }
                    ]}
                >
                    <TextArea
                        ref={ textareaRef }
                        rows={3} 
                        value={ editFileName }
                        onChange={e => setEditFileName(e.target.value)}
                        placeholder='Введине новое имя файла, 1-255 символов кроме ^\/:*?"<>|'
                        maxLength={255}
                        minLength={1}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>

        {/* Модальное окно редактирования комментария */}
        <Modal
            title={
              <div className="modal-custom-comment-title">
                  Редактирование комментария для файла<br />
                  <span className="filename">{ editingFile?.original_name || '' }</span>
              </div>
            }
            open={ editCommentModalVisible }
            onOk={ handleEditComment }
            onCancel={() => setEditCommentModalVisible(false)}
            afterOpenChange={(opened) => {
              if (opened && textareaRef.current) {
                setTimeout(() => {
                  textareaRef.current.focus();
                }, 50);
              };
            }}
            okText="Сохранить"
            cancelText="Отмена"
        >
            <Form layout="vertical">
                <Form.Item>
                    <TextArea 
                        ref={ textareaRef }
                        rows={4} 
                        value={ editComment }
                        onChange={e => setEditComment(e.target.value)}
                        placeholder="Введите комментарий к файлу"
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    </div>
  );
};

export default FilesManager;
