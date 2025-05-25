import { Button } from 'antd';

const FileTransferConfirmation = ({ data, onAccept, onDecline }) => {
  return (
    <div className="file-transfer-confirmation">
      <p>{`${data.senderName} wants to send ${data.fileName} (${(
        data.fileSize /
        (1024 * 1024)
      ).toFixed(2)} MB)`}</p>
      <div>
        <Button
          variant="solid"
          color="primary"
          onClick={onAccept}
          className="file-transfer-button file-transfer-button-accept"
        >
          Accept
        </Button>
        <Button
          variant="solid"
          color="danger"
          onClick={onDecline}
          className="file-transfer-button"
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

export default FileTransferConfirmation; 