
import { Stack, router } from "expo-router";
import { StyleSheet, Text, View, Button, TextInput, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("biblioteca.db");

db.execSync(`
    CREATE TABLE IF NOT EXISTS compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item VARCHAR(255) NOT NULL,
        quantidade INTEGER NOT NULL,
        comprado BOOLEAN NOT NULL
    );
`);

function listar() {
    return db.getAllSync("SELECT * FROM compra ORDER BY id DESC");
}

function salvar(item, quantidade, comprado) {
    db.runSync(
        "INSERT INTO compra (item, quantidade, comprado) VALUES (?, ?, ?)",
        [item, quantidade, comprado]
    );
}

function excluir(codigo) {
    db.runSync("DELETE FROM compra WHERE id = ?", [codigo]);
}

function excluirComprado() {
    db.runSync("DELETE FROM compra WHERE comprado = 1");
}

function edita(item, quantidade, comprado, id) {
    db.runSync(
        "UPDATE compra SET item = ?, quantidade = ?, comprado = ? WHERE id = ?",
        [item, quantidade, comprado, id]
    );
}

// Alterna entre comprado e não comprado
function alternarComprado(id) {
    db.runSync(
        "UPDATE compra SET comprado = CASE WHEN comprado = 1 THEN 0 ELSE 1 END WHERE id = ?",
        [id]
    );
}

export default function App() {

    const [item, setItem] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [comprado, setComprado] = useState("");
    const [lista, setLista] = useState([]);
    const [idEditando, setIdEditando] = useState(0);

    function carregar() {
        setLista(listar());
    }

    function guardarOuEditar() {
        if (!item.trim() || !quantidade.trim()) {
            return;
        }

        const compradoBoolean =
            comprado.trim().toLowerCase() === "sim" ? 1 : 0;

        if (idEditando === 0) {
            salvar(item, Number(quantidade), compradoBoolean);
        } else {
            edita(item, Number(quantidade), compradoBoolean, idEditando);
        }

        setItem("");
        setQuantidade("");
        setComprado("");
        setIdEditando(0);
        carregar();
    }

    function remover(codigo) {
        excluir(codigo);
        carregar();
    }

    function removerComprado() {
        excluirComprado();
        carregar();
    }

    function marcarComprado(id) {
        alternarComprado(id);
        carregar();
    }

    function editar(compra) {
        setIdEditando(compra.id);
        setItem(compra.item);
        setQuantidade(String(compra.quantidade));
        setComprado(compra.comprado === 1 ? "Sim" : "Não");
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <SafeAreaView style={styles.main}>
            <Stack.Screen options={{ title: "App Biblioteca" }} />

            <Text style={styles.titulo}>Lista de Compras</Text>

            <TextInput
                style={styles.input}
                value={item}
                onChangeText={setItem}
                placeholder="Nome do Item"
                placeholderTextColor="#555"
            />

            <TextInput
                style={styles.input}
                value={quantidade}
                onChangeText={setQuantidade}
                placeholder="Quantidade"
                placeholderTextColor="#555"
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                value={comprado}
                onChangeText={setComprado}
                placeholder="Comprado Sim/Não"
                placeholderTextColor="#555"
            />

            <View style={styles.botao}>
                <Button
                    title={idEditando === 0 ? "Salvar" : "Atualizar"}
                    color="#000000"
                    onPress={guardarOuEditar}
                />
            </View>

            <FlatList
                style={styles.lista}
                data={lista}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.caixaLista}>

                        <TouchableOpacity
                            style={styles.areaItem}
                            onPress={() => marcarComprado(item.id)}
                        >
                            <Text
                                style={[
                                    styles.item,
                                    item.comprado === 1 && styles.riscado
                                ]}
                            >
                                Item: {item.item}
                            </Text>

                            <Text
                                style={[
                                    styles.item,
                                    item.comprado === 1 && styles.riscado
                                ]}
                            >
                                Quantidade: {item.quantidade}
                            </Text>

                            <Text
                                style={[
                                    styles.item,
                                    item.comprado === 1 && styles.riscado
                                ]}
                            >
                                Comprado: {item.comprado === 1 ? "Sim" : "Não"}
                            </Text>
                        </TouchableOpacity>

                        <View>
                            <Button
                                title="Editar"
                                color="#000000"
                                onPress={() => editar(item)}
                            />

                            <Button
                                title="Excluir"
                                color="#000000"
                                onPress={() => remover(item.id)}
                            />
                        </View>

                    </View>
                )}
            />

            <Button
                title="Limpar comprados"
                color="#000000"
                onPress={removerComprado}
            />

            <Button
                title="VOLTAR"
                onPress={() => router.back()}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: "flex-start",
        gap: 10
    },

    titulo: {
        fontWeight: "bold",
        fontSize: 25
    },

    input: {
        borderWidth: 1,
        borderColor: "#D9DDE3",
        borderRadius: 12,
        width: 300,
        padding: 12,
        fontSize: 16,
        color: "#111827",
        marginBottom: 12,
    },

    caixaLista: {
        backgroundColor: "#ffffff",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "row",
        padding: 10,
        borderWidth: 1,
        borderColor: "#000000",
        marginBottom: 8
    },

    areaItem: {
        flex: 1,
        padding: 5
    },

    item: {
        fontSize: 16,
        color: "#000000"
    },

    riscado: {
        textDecorationLine: "line-through",
        color: "#999999"
    },

    botao: {
        backgroundColor: "#d5f2f3",
        borderRadius: 15,
        width: 150,
        borderColor: "#000000",
        borderWidth: 1
    },

    lista: {
        padding: 10,
        width: "100%"
    }
});
