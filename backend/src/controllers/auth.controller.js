import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const result = await authService.register({
      username,
      email,
      password,
      role,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
    try{
     const { username, password } = req.body;
     const result = await authService.login({ username, password });
     res.status(200).json(result);   
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}