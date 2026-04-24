import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CardContent,
  Card,
  Grid,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import AxiosApi from "./utils/AxiosApis";

// Define status types
type TodoStatus = "pending" | "success" | "todo" | "cancel";

interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
}

const theme = createTheme({
  palette: {
    mode: "dark", // We'll stick to a sleek dark mode by default for premium feel
    primary: {
      main: "#6366f1", // Indigo
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const getStatusColor = (status: TodoStatus) => {
  switch (status) {
    case "success":
      return "#22c55e"; // Green
    case "pending":
      return "#eab308"; // Yellow
    case "cancel":
      return "#ef4444"; // Red
    case "todo":
      return "#64748b"; // Grey (Slate 500)
    default:
      return "#64748b";
  }
};

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Status Menu State
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [activeTodoId, setActiveTodoId] = useState<number | null>(null);

  // Actions Menu State
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [actionsTodoId, setActionsTodoId] = useState<number | null>(null);

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [selectStatus, setSelectStatus] = useState('todo')

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), title: inputValue, status: "todo" },
      ]);
      setInputValue("");
      PostTodos()
    }
  };

  const handleStatusClick = (
    event: React.MouseEvent<HTMLDivElement>,
    id: number,
  ) => {
    setStatusAnchorEl(event.currentTarget);
    setActiveTodoId(id);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
    setActiveTodoId(null);
  };

 const handleStatusChange = (newStatus: TodoStatus) => {
  if (activeTodoId !== null) {
    const todo = todos.find((t) => t.id === activeTodoId);

    if (todo) {
      // update UI
      setTodos(
        todos.map((t) =>
          t.id === activeTodoId ? { ...t, status: newStatus } : t
        )
      );

      // 🔥 send correct data to API
      PatchTodos(activeTodoId, todo.title, newStatus);
    }
  }

  handleStatusClose();
};

  const handleActionsClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number,
  ) => {
    setActionsAnchorEl(event.currentTarget);
    setActionsTodoId(id);
  };

  const handleActionsClose = () => {
    setActionsAnchorEl(null);
    // setActionsTodoId(null);
  };

  const handleDeleteTodo = () => {
    if (actionsTodoId !== null) {
      setTodos(todos.filter((t) => t.id !== actionsTodoId));
    }
    handleActionsClose();
    DeleteTodos()
  };

  const handleEditOpen = () => {
    if (actionsTodoId !== null) {
      const todo = todos.find((t) => t.id === actionsTodoId);
      if (todo) {
        setEditValue(todo.title);
        setEditDialogOpen(true);
        setSelectStatus(todo.status)
      }
    }
    handleActionsClose();
  };


 const handleEditSave = () => {
  if (actionsTodoId !== null && editValue.trim()) {
    const todo = todos.find((t) => t.id === actionsTodoId);

    if (!todo) return;

    setTodos(
      todos.map((t) =>
        t.id === actionsTodoId
          ? { ...t, title: editValue, status: selectStatus }
          : t
      )
    );

    PatchTodos(actionsTodoId, editValue, selectStatus);
  }

  setEditDialogOpen(false);
};

  // fetch all todos
  const FetchAllTodos = async () => {
    try {
      const response = await AxiosApi({endpoint : '/api/alltodos'})
      setTodos(response?.data?.todo)
    } catch (error) {
      console.error('Erro : ', error)
    }
  }

  // post todos
  const PostTodos = async () => {
    const data : {title : string, status : string} = {
      title : inputValue,
      status : 'TODO'
    }
    try {
      const response = await AxiosApi({endpoint : '/api/post/todo', data, method : 'POST'})
      console.log(response)
    } catch (error) {
      console.error('error : ', error)
    }
  }

  // delete todos
  const DeleteTodos = async () => {
    try {
      const response = await AxiosApi({method : "DELETE", endpoint : `/api/delete/${actionsTodoId}`})
      console.log(response)
    } catch (error) {
      console.error("Error : ", error)
    }
  }

  // Patch todos
 const PatchTodos = async (
  id: number,
  title: string,
  status: TodoStatus
) => {
  try {
    const response = await AxiosApi({
      endpoint: `/api/update/${id}`,
      method: "PATCH",
      data: { title, status },
    });

    console.log(response);
  } catch (error) {
    console.error("Error:", error);
  }
};

  useEffect(() => {
    FetchAllTodos()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", mb : 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="left"
              sx={{ fontWeight: 800 }}
            >
              Tasks
            </Typography>
            <Typography sx={{fontWeight : 'bold'}}>{todos.length}</Typography>
          </Stack>

          <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              onClick={handleAddTodo}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ width: "100%", p: 1 }}>
            <Grid container spacing={2}>
              {todos.map((todo) => (
                <Grid size={{ xs: 12, sm: 6 }} key={todo.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow:
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        transform: "translateY(-4px)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%",
                        p: 3,
                        "&:last-child": { pb: 3 },
                      }}
                    >
                      {/* Title */}
                      <Typography
                        sx={{
                          fontWeight: 500,
                          textAlign: "left",
                          mb: 1,
                          textDecoration:
                            todo.status === "cancel" ? "line-through" : "none",
                          color:
                            todo.status === "success"
                              ? "text.secondary"
                              : "text.primary",
                        }}
                      >
                        {todo.title}
                      </Typography>

                      {/* Bottom row */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={todo.status.toUpperCase()}
                          size="small"
                          onClick={(e) => handleStatusClick(e, todo.id)}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            cursor: "pointer",
                            bgcolor: getStatusColor(todo.status),
                            color: "#fff",
                          }}
                        />

                        <IconButton
                          onClick={(e) => handleActionsClick(e, todo.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {todos.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4, fontStyle: "italic" }}
            >
              No tasks yet. Add one above!
            </Typography>
          )}
        </Paper>

        {/* Status Menu */}
        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={handleStatusClose}
          slotProps={{
            paper: {
              sx: { mt: 1, borderRadius: 2, minWidth: 120 },
            },
          }}
        >
          {(["pending", "success", "todo", "cancel"] as TodoStatus[]).map(
            (status) => (
              <MenuItem key={status} onClick={() => handleStatusChange(status)}>
                <Chip
                  label={status.toUpperCase()}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    width: "100%",
                    bgcolor: getStatusColor(status),
                    color: "#fff",
                  }}
                />
              </MenuItem>
            ),
          )}
        </Menu>

        {/* Actions Menu */}
        <Menu
          anchorEl={actionsAnchorEl}
          open={Boolean(actionsAnchorEl)}
          onClose={handleActionsClose}
          slotProps={{
            paper: {
              sx: { mt: 1, borderRadius: 2 },
            },
          }}
        >
          <MenuItem onClick={handleEditOpen}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteTodo} sx={{ color: "error.main" }}>
            Delete
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              autoFocus
              variant="outlined"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default TodoApp;
