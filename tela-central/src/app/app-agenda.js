import { Stack, router } from "expo-router";
import { StyleSheet, Text, View, Button, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("agenda.db");

db.execSync(`
    CREATE TABLE IF NOT EXISTS contato (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(255) NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM contato ORDER BY id DESC");
}

function salvar(nome, telefone) {
    db.runSync("INSERT INTO contato (nome, telefone) VALUES (?, ?)", [nome, telefone]);
}

function excluir(codigo) {
    db.runSync("DELETE FROM contato WHERE id = ?", [codigo]);
}

function edita(nome, telefone, id) {
    db.runSync("UPDATE contato SET nome = ?, telefone = ? WHERE id = ?", [
        nome,
        telefone,
        id,
    ]);
}


export default function App() {

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [lista, setLista] = useState([]);
    const [idEditando, setIdEditando] = useState(0);


    function carregar() {
        setLista(listar());
    }

    function guardarOuEditar() {
        if (idEditando === 0) {
            salvar(nome, telefone);
        } else {
            edita(nome, telefone, idEditando);
        }
        setNome("");
        setTelefone("");
        setIdEditando(0);
        carregar();
    }

    function remover(codigo) {
        excluir(codigo);
        carregar();
    }

    function editar(agenda) {
        setIdEditando(agenda.id);
        setNome(agenda.nome);
        setTelefone(agenda.telefone);
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <SafeAreaView style={styles.main}>
            <Stack.Screen options={{ title: "App Flor" }} />
            <Text style={styles.titulo}>Cadastro de Contatos</Text>
            <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome do contato"
                placeholderTextColor="#555"
            />
            <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
                placeholder="Telefone"
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
                            <Text style={styles.item}>Nome: {item.nome}</Text>
                            <Text style={styles.item}>Telefone: {item.telefone}</Text>
                        </View>
                        <View>
                            <Button title="Editar" color="#000000" onPress={() => editar(item)} />
                            <Button title="Excluir" color="#000000" onPress={() => remover(item.id)} />
                        </View>
                    </View>)
                }
            />

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
