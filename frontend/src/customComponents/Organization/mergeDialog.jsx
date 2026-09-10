import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MergeTypeIcon from "@mui/icons-material/MergeType";

import {
  getLookup,
  mergePreview,
  mergeOrganizations,
} from "store/reducers/core/Organization";

// Two step dialog: pick the pair, review what would move, then commit.
// The preview step is the confirmation - it is the only place the operator
// sees how many rows the merge touches.
export default ({ visible, close, merged }) => {
  const dispatch = useDispatch();

  const [organizations, setOrganizations] = useState([]);
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    const load = async () => {
      const result = await dispatch(
        getLookup({ take: 1000, sort: [{ selector: "Name", desc: false }] }, [
          "Id",
          "Name",
        ]),
      );
      if (!cancelled) setOrganizations((result && result.data) || []);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [visible, dispatch]);

  // Any change to the pair invalidates the reviewed numbers
  useEffect(() => setPreview(null), [source, target]);

  const reset = () => {
    setSource(null);
    setTarget(null);
    setPreview(null);
    setLoadingPreview(false);
    setMerging(false);
  };

  const handleClose = () => {
    reset();
    close && close();
  };

  const sameOrg = source && target && source.Id === target.Id;
  const canPreview = !!source && !!target && !sameOrg;

  const loadPreview = async () => {
    setLoadingPreview(true);
    const result = await dispatch(
      mergePreview({ SourceId: source.Id, TargetId: target.Id }),
    );
    setLoadingPreview(false);
    if (result) setPreview(result);
  };

  const confirmMerge = async () => {
    setMerging(true);
    const ok = await dispatch(
      mergeOrganizations({ SourceId: source.Id, TargetId: target.Id }),
    );
    setMerging(false);
    if (ok) {
      handleClose();
      merged && merged();
    }
  };

  if (!visible) return null;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <MergeTypeIcon color="primary" />
        Байгууллага нэгтгэх
      </DialogTitle>

      <DialogContent dividers>
        <Autocomplete
          options={organizations}
          value={source}
          onChange={(e, value) => setSource(value)}
          getOptionLabel={(option) => option.Name || ""}
          isOptionEqualToValue={(option, value) => option.Id === value.Id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Нэгтгэх байгууллага (идэвхгүй болно)"
              size="small"
              margin="dense"
            />
          )}
        />

        <Autocomplete
          options={organizations}
          value={target}
          onChange={(e, value) => setTarget(value)}
          getOptionLabel={(option) => option.Name || ""}
          isOptionEqualToValue={(option, value) => option.Id === value.Id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Үлдэх байгууллага (мэдээлэл энд шилжинэ)"
              size="small"
              margin="dense"
            />
          )}
        />

        {sameOrg && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Ижил байгууллагыг сонгосон байна
          </Alert>
        )}

        {preview && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              <Typography variant="body2">
                <b>{preview.SourceName}</b> байгууллагын <b>{preview.Total}</b>{" "}
                бичлэг <b>{preview.TargetName}</b> руу шилжинэ. Нэгтгэсний дараа{" "}
                <b>{preview.SourceName}</b> идэвхгүй болж, сонголтын жагсаалтад
                харагдахаа болино. Энэ үйлдлийг буцаах боломжгүй.
              </Typography>
            </Alert>

            {preview.Items && preview.Items.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Хүснэгт</TableCell>
                    <TableCell>Талбар</TableCell>
                    <TableCell align="right">Бичлэг</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.Items.map((item) => (
                    <TableRow key={`${item.Table}.${item.Column}`}>
                      <TableCell>{item.Table}</TableCell>
                      <TableCell>{item.Column}</TableCell>
                      <TableCell align="right">{item.Count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Шилжих бичлэг байхгүй байна. Зөвхөн байгууллага идэвхгүй болно.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={merging}>
          Болих
        </Button>

        {!preview ? (
          <Button
            onClick={loadPreview}
            variant="contained"
            disabled={!canPreview || loadingPreview}
            startIcon={
              loadingPreview ? <CircularProgress size={16} /> : undefined
            }
          >
            Шалгах
          </Button>
        ) : (
          <Button
            onClick={confirmMerge}
            variant="contained"
            color="error"
            disabled={merging}
            startIcon={merging ? <CircularProgress size={16} /> : undefined}
          >
            Нэгтгэх
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
