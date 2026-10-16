import { Stack, router } from "expo-router";
import { StyleSheet, Text, View, Button, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("filmes.db");

db.execSync(`
    CREATE TABLE IF NOT EXISTS filme (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(255) NOT NULL,
        nota DECIMAL(10, 2) NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM filme ORDER BY id DESC");
}

function salvar(titulo, nota) {
    db.runSync("INSERT INTO filme (titulo, nota) VALUES (?, ?)", [titulo, nota]);
}

function excluir(codigo) {
    db.runSync("DELETE FROM filme WHERE id = ?", [codigo]);
}

function edita(titulo, nota, id) {
    db.runSync("UPDATE filme SET titulo = ?, nota = ? WHERE id = ?", [
        titulo,
        nota,
        id,
    ]);
}


export default function App() {

    const [titulo, setTitulo] = useState("");
    const [nota, setNota] = useState("");
    const [lista, setLista] = useState([]);
    const [idEditando, setIdEditando] = useState(0);


    function carregar() {
        setLista(listar());
    }

    function guardarOuEditar() {
        if (idEditando === 0) {
            salvar(titulo, nota);
        } else {
            edita(titulo, nota, idEditando);
        }
        setTitulo("");
        setNota("");
        setIdEditando(0);
        carregar();
    }

    function remover(codigo) {
        excluir(codigo);
        carregar();
    }

    function editar(filme) {
        setIdEditando(filme.id);
        setTitulo(filme.titulo);
        setNota(filme.nota);
    }

    useEffect(() => {
        carregar();
    }, []);

    return (
        <SafeAreaView style={styles.main}>
            <Stack.Screen options={{ title: "App Filme" }} />
            <Text style={styles.titulo}>Avaliação de Filmes</Text>
            <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Titulo do Filme"
                placeholderTextColor="#555"
            />
            <TextInput
                style={styles.input}
                value={nota}
                onChangeText={setNota}
                placeholder="Nota do Filme"
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
                            <Text style={styles.item}>Titulo: {item.titulo}</Text>
                            <Text style={[ styles.item, { color: item.nota >= 7 ? "green" : "red" }]}>
                                Nota: {Number(item.nota).toFixed(1)}
                            </Text>
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