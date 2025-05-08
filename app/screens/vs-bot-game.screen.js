import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";

export default function VsBotGameScreen({ navigation }) {
    const socket = useContext(SocketContext);

    // On démarre automatiquement la partie contre le bot
    useEffect(() => {
        if (socket) {
            socket.emit('queue.join-bot');
        }
    }, [socket]);

    return (
        <View style={styles.container}>
            {!socket ? (
                <>
                    <Text style={styles.paragraph}>No connection with server...</Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </>
            ) : (
                <>
                    <Board gameViewState={"vsBot"} />
                    <Button
                        title="Revenir au menu"
                        onPress={() => navigation.navigate('HomeScreen')}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    paragraph: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    footnote: {
        fontSize: 12,
        color: "#555",
        marginBottom: 20,
        textAlign: "center",
    }
});
