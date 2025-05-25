import React from "react";
import { Avatar, Space } from "antd";
import AvatarIcons from "../utils/avatarIcons.js";
import { Typography } from "antd";
import Ripples from "./Ripples.jsx"
const { Title } = Typography;

function AvatarIcon(props) {
  return (
    <Ripples>
      <div className="avatar-icon-container">
        <Space direction="vertical" size={16}>
          <Space
            wrap
            size={16}
            className="avatar-icon-space"
          >
            <Avatar
              size={64}
              src={
                props.peerName ? AvatarIcons[props.peerName.split(" ")[1]] : ""
              }
            />
            <Title
              level={5}
              className="avatar-icon-title"
            >
              {props.peerName}{" "}
            </Title>
          </Space>
        </Space>
      </div>
    </Ripples>
  );
}

export default AvatarIcon;
