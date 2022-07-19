import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSigner, useProvider, useAccount } from "wagmi";
import { Client } from "@xmtp/xmtp-js";
import { useEffect, useState } from "react";
import {
  Box,
  Input,
  Button,
  List,
  ListItem,
} from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { ethers } from "ethers";
import truncateEthAddress from "truncate-eth-address";

export default function Home() {

  const [conversations, setConversations] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState("");
  const [xmtp, setXMTP] = useState();

  const { data: signer } = useSigner();

  const { address } = useAccount({
    async onConnect() {
      console.log(address);
      const xmtp = await Client.create(signer);
      setXMTP(xmtp)
      await getAllConversations()
    },
  });

  const getAllConversations = async () => {
    try {
      const allConversations = await xmtp.conversations.list();
      setConversations(allConversations);
      for (const conversation of allConversations) {
        console.log(`${conversation.peerAddress}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    try {
      if (receiverAddress) {
        console.log(receiverAddress);
        if (ethers.utils.isAddress(receiverAddress)) {
          const conversation = await xmtp.conversations.newConversation(
            receiverAddress
          );
          console.log(conversation);
          if (message) {
            await conversation.send(message);
            setMessage("");
          }
        } else {
          console.log("not a valid address");
        }
      } else {
        console.log("receiver address is required");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = async (receiverAddress) => {
    try {
      const conversation = await xmtp.conversations.newConversation(
        receiverAddress
      );
      const messages = await conversation.messages();
      setMessages(messages);
      messages.map((message, index) => {
        console.log(
          message.senderAddress + "-" + message.content + "-" + index
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main class="grid grid-rows-2">
        <div class="flex justify-end space-x-3 m-5">
          <ConnectButton />
          <Button onClick={getAllConversations}>Join XMTP</Button>
        </div>
        <div class="grid gap-1">
          <div class="grid-cols-4">
            {address && conversations ? (
              <Box>
                <List spacing={3}>
                  {conversations.map((value, index) => {
                    return (
                      <ListItem key={index}>
                        <Button
                          onClick={(e) => {
                            setReceiverAddress(e.target.value);
                            getMessages(e.target.value);
                          }}
                          value={value.peerAddress}
                        >
                          {value.peerAddress}
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : (
              <div></div>
            )}
          </div>
          <div class="grid-cols-8">
            {address && messages ? (
              <div>
                <Box h={300} p={4} overflowY="scroll">
                  <List spacing={3}>
                    {messages.map((message, index) => {
                      return (
                        <ListItem key={index}>
                          <Button value={message.senderAddress}>
                            {truncateEthAddress(message.senderAddress)}
                            <br />
                            {message.content}
                          </Button>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
                <Input
                  variant="filled"
                  placeholder="Enter Address"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                />
                <br />
                <Input
                  variant="filled"
                  placeholder="Enter Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <br />
                <Button
                  rightIcon={<IoMdSend />}
                  colorScheme="blue"
                  size="md"
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
