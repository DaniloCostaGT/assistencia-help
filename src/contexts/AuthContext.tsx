const fetchOrganization = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, status, trial_ends_at')
      .eq('owner_id', userId)
      .maybeSingle();

    if (!error && data) {
      if (data.status === 'suspended') {
        alert('Sua conta está suspensa. Entre em contato com o suporte.');
        await supabase.auth.signOut();
        setOrganizationId(null);
        return;
      }
      setOrganizationId(data.id);
    } else {
      setOrganizationId(null);
    }
  } catch (err) {
    console.error('Erro ao buscar organização:', err);
    setOrganizationId(null);
  }
};