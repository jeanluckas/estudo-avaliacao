import { Stack, router } from "expo-router";
import { StyleSheet, Text, View, Button, TextInput, FlatList } from 'react-native';
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
    db.runSync("INSERT INTO compra (item, quantidade, comprado) VALUES (?, ?, ?)", [item, quantidade, comprado]);
}

function excluir(codigo) {
    db.runSync("DELETE FROM compra WHERE id = ?", [codigo]);
}

function excluirComprado() {
    db.runSync("DELETE FROM compra WHERE comprado = TRUE");
}

function edita(item, quantidade, comprado, id) {
    db.runSync("UPDATE compra SET item = ?, quantidade = ?, comprado = ? WHERE id = ?", [
        item,
        quantidade,
        comprado,
        id,
    ]);
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
        if (idEditando === 0) {
            salvar(item, quantidade, comprado);
        } else {
            edita(item, quantidade, comprado, idEditando);
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

    function editar(compra) {
        setIdEditando(compra.id);
        setItem(compra.item);
        setQuantidade(String(compra.quantidade));
        setComprado(compra.comprado);

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
            />

            <TextInput
                style={styles.input}
                value={comprado}
                onChangeText={setComprado}
                placeholder="Comprado Sim/Não"
                placeholderTextColor="#555"
            />

            <View style={styles.botao}>
                <Button title="Salvar" color="#000000" onPress={guardarOuEditar} />
            </View>

            <FlatList
                style={styles.lista}
                data={lista}
                renderItem={({ item }) => (
                    <View style={styles.caixaLista}>
                        <View>
                            <Text style={styles.item}>Item: {item.item}</Text>
                            <Text style={styles.item}>Quantidade: {item.quantidade}</Text>
                            <Text style={styles.item}>Comprado: {item.comprado}</Text>

                        </View>
                        <View>
                            <Button title="Editar" color="#000000" onPress={() => editar(item)} />
                            <Button title="Excluir" color="#000000" onPress={() => remover(item.id)} />

                        </View>

                    </View>)

                }
            />
            < Button title="Excluir Comprados" color="#000000" onPress={() => removerComprado()} />
            < Button title="VOLTAR" onPress={() => router.back()} />
        </SafeAreaView >
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
        padding: 5,
        borderWidth: 1,
        borderColor: "#000000",
        marginBottom: 8
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
    }
});
