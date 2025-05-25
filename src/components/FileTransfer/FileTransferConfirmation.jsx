import { Button } from 'antd';

const FileTransferConfirmation = ({ data, onAccept, onDecline }) => {
  return (
    <div>
      <p>{`${data.senderName} wants to send ${data.fileName} (${(
        data.fileSize /
        (1024 * 1024)
      ).toFixed(2)} MB)`}</p>
      <div>
        <Button
          variant="solid"
          color="primary"
          onClick={onAccept}
          style={{
            marginRight: "8px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Accept
        </Button>
        <Button
          variant="solid"
          color="danger"
          onClick={onDecline}
          style={{ padding: "5px 10px", cursor: "pointer" }}
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

export default FileTransferConfirmation; 